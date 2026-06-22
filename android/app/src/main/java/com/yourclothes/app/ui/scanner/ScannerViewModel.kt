package com.yourclothes.app.ui.scanner

import android.content.Context
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.yourclothes.app.data.*
import com.yourclothes.app.utils.FileUtils
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.util.UUID

sealed class ScannerState {
    object Idle : ScannerState()
    object Uploading : ScannerState()
    data class Analyzing(val imageUrl: String) : ScannerState()
    data class Success(val item: WardrobeItem) : ScannerState()
    data class Error(val message: String) : ScannerState()
}

class ScannerViewModel(
    private val wardrobeRepository: WardrobeRepository,
    private val authRepository: AuthRepository,
    private val aiRepository: AIRepository
) : ViewModel() {

    private val _state = MutableStateFlow<ScannerState>(ScannerState.Idle)
    val state: StateFlow<ScannerState> = _state

    fun processImage(uri: Uri, context: Context) {
        viewModelScope.launch {
            val user = authRepository.getCurrentUser() ?: run {
                _state.value = ScannerState.Error("Niet ingelogd")
                return@launch
            }

            try {
                _state.value = ScannerState.Uploading
                
                // 1. Prepare file
                val contentResolver = context.contentResolver
                val mimeType = contentResolver.getType(uri) ?: "image/jpeg"
                val fileExtension = FileUtils.getExtensionFromMimeType(mimeType)
                val bytes = FileUtils.readUriToBytes(context, uri)

                // 2. Upload
                val fileName = "${user.id}/scans/${UUID.randomUUID()}.$fileExtension"
                val publicUrl = wardrobeRepository.uploadPhoto(fileName, bytes, mimeType)

                // 3. Analyze
                _state.value = ScannerState.Analyzing(publicUrl)
                val aiResult = aiRepository.analyzeClothing(
                    ClothingAnalysisRequest(imageUrl = publicUrl)
                )

                val analysis = aiResult.getOrNull() ?: throw Exception("AI Analyse mislukt")

                // 4. Save
                val newItem = WardrobeItem(
                    userId = user.id,
                    imageUrl = publicUrl,
                    category = analysis.category,
                    color = analysis.color,
                    style = analysis.style,
                    fabric = analysis.fabric
                )
                wardrobeRepository.addItem(newItem)
                
                _state.value = ScannerState.Success(newItem)
            } catch (e: Exception) {
                _state.value = ScannerState.Error(e.message ?: "Onbekende fout")
            }
        }
    }

    fun reset() {
        _state.value = ScannerState.Idle
    }
}
