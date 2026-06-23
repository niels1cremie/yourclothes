package com.yourclothes.app.ui.wardrobe

import android.content.Context
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.yourclothes.app.data.AIRepository
import com.yourclothes.app.data.AuthRepository
import com.yourclothes.app.data.WardrobeItem
import com.yourclothes.app.data.WardrobeRepository
import com.yourclothes.app.utils.FileUtils
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.util.UUID

sealed class WardrobeState {
    object Loading : WardrobeState()
    data class Success(val items: List<WardrobeItem>, val categorizedItems: Map<String, List<WardrobeItem>>) : WardrobeState()
    data class Error(val message: String) : WardrobeState()
}

class WardrobeViewModel(
    private val wardrobeRepository: WardrobeRepository,
    private val authRepository: AuthRepository,
    private val aiRepository: AIRepository
) : ViewModel() {

    private val _state = MutableStateFlow<WardrobeState>(WardrobeState.Loading)
    val state: StateFlow<WardrobeState> = _state

    init {
        loadItems()
    }

    fun loadItems() {
        viewModelScope.launch {
            _state.value = WardrobeState.Loading
            val user = authRepository.getCurrentUser()
            if (user != null) {
                try {
                    val items = wardrobeRepository.getItems(user.id)
                    val categorizedItems = wardrobeRepository.getItemsByCategory(user.id)
                    _state.value = WardrobeState.Success(items, categorizedItems)
                } catch (e: Exception) {
                    _state.value = WardrobeState.Error("Fout bij laden kledingkast: ${e.message}")
                }
            } else {
                _state.value = WardrobeState.Error("Niet ingelogd")
            }
        }
    }

    fun uploadAndAnalyze(uri: Uri, context: Context) {
        viewModelScope.launch {
            val user = authRepository.getCurrentUser() ?: return@launch
            try {
                // 1. Detect file extension from URI
                val contentResolver = context.contentResolver
                val mimeType = contentResolver.getType(uri) ?: "image/jpeg"
                val fileExtension = "jpg" // Altijd JPEG omdat we downsamplen en comprimeren

                // 2. Read and downsample image to prevent OOM errors
                val bytes = FileUtils.readAndDownsampleUri(context, uri)

                // 3. Upload to Supabase Storage
                val fileName = "${user.id}/${UUID.randomUUID()}.$fileExtension"
                val publicUrl = wardrobeRepository.uploadPhoto(fileName, bytes, "image/jpeg")

                // 4. AI Analysis via Edge Function
                val aiResult = aiRepository.analyzeClothing(
                    com.yourclothes.app.data.ClothingAnalysisRequest(imageUrl = publicUrl)
                )

                val analysis = aiResult.getOrNull() ?: throw Exception("AI analyse mislukt")

                // 5. Create item with AI analysis
                val newItem = WardrobeItem(
                    userId = user.id,
                    imageUrl = publicUrl,
                    category = analysis.category,
                    color = analysis.color,
                    style = analysis.style,
                    fabric = analysis.fabric
                )
                wardrobeRepository.addItem(newItem)
                loadItems()
            } catch (e: Exception) {
                _state.value = WardrobeState.Error("Upload mislukt: ${e.message}")
            }
        }
    }
}
