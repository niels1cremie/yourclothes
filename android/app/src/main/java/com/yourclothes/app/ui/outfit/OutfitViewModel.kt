package com.yourclothes.app.ui.outfit

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.yourclothes.app.data.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class OutfitState {
    object Idle : OutfitState()
    object Loading : OutfitState()
    data class Success(val items: List<WardrobeItem>, val reasoning: String) : OutfitState()
    data class Error(val message: String) : OutfitState()
}

class OutfitViewModel(
    private val wardrobeRepository: WardrobeRepository,
    private val authRepository: AuthRepository,
    private val aiRepository: AIRepository,
    private val profileRepository: ProfileRepository,
    private val plannerRepository: PlannerRepository
) : ViewModel() {

    private val _state = MutableStateFlow<OutfitState>(OutfitState.Idle)
    val state: StateFlow<OutfitState> = _state

    fun generate(occasion: String) {
        viewModelScope.launch {
            val user = authRepository.getCurrentUser() ?: return@launch
            try {
                _state.value = OutfitState.Loading
                
                // 1. Get user items
                val items = wardrobeRepository.getItems(user.id)
                if (items.isEmpty()) {
                    _state.value = OutfitState.Error("Je kledingkast is leeg. Scan eerst wat kleding!")
                    return@launch
                }

                // 2. Get user profile
                val profile = profileRepository.getProfile(user.id)

                // 3. Generate
                val request = OutfitGenerationRequest(
                    items = items,
                    occasion = occasion,
                    profile = profile
                )

                val result = aiRepository.generateOutfit(request)
                val response = result.getOrNull() ?: throw Exception("Kon geen outfit genereren")

                // 4. Map IDs back to items
                val selectedItems = items.filter { response.selected_item_ids.contains(it.id) }
                
                _state.value = OutfitState.Success(selectedItems, response.reasoning)
            } catch (e: Exception) {
                _state.value = OutfitState.Error(e.message ?: "Onbekende fout")
            }
        }
    }

    fun saveToPlanner(items: List<WardrobeItem>, occasion: String) {
        viewModelScope.launch {
            val user = authRepository.getCurrentUser() ?: return@launch
            try {
                val today = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ISO_DATE)
                val outfit = PlannedOutfit(
                    userId = user.id,
                    date = today,
                    occasion = occasion,
                    items = items,
                    notes = "Gegenereerd door MIRROR AI"
                )
                plannerRepository.createPlannedOutfit(outfit)
            } catch (ignored: Exception) {
                // Simplified error handling
            }
        }
    }

    fun reset() {
        _state.value = OutfitState.Idle
    }
}
