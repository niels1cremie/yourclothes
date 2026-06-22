package com.yourclothes.app.ui.insights

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.yourclothes.app.data.AuthRepository
import com.yourclothes.app.data.WardrobeItem
import com.yourclothes.app.data.WardrobeRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class InsightsState {
    object Loading : InsightsState()
    data class Success(
        val totalItems: Int,
        val topCategory: String,
        val leastWornItem: WardrobeItem?,
        val colorDistribution: Map<String, Int>,
        val aiRecommendations: String? = null
    ) : InsightsState()
    data class Error(val message: String) : InsightsState()
}

class InsightsViewModel(
    private val wardrobeRepository: WardrobeRepository,
    private val authRepository: AuthRepository,
    private val aiRepository: com.yourclothes.app.data.AIRepository
) : ViewModel() {

    private val _state = MutableStateFlow<InsightsState>(InsightsState.Loading)
    val state: StateFlow<InsightsState> = _state

    init {
        loadInsights()
    }

    fun loadInsights() {
        viewModelScope.launch {
            val user = authRepository.getCurrentUser() ?: return@launch
            try {
                _state.value = InsightsState.Loading
                val items = wardrobeRepository.getItems(user.id)
                
                if (items.isEmpty()) {
                    _state.value = InsightsState.Error("Nog geen data beschikbaar. Begin met het scannen van kleding!")
                    return@launch
                }

                val topCategory = items.groupBy { it.category }
                    .maxByOrNull { it.value.size }?.key ?: "Geen"
                
                val leastWornItem = items.minByOrNull { it.timesWorn }
                
                val colorDistribution = items.groupBy { it.color ?: "Onbekend" }
                    .mapValues { it.value.size }

                // Initial success state without AI recommendations
                _state.value = InsightsState.Success(
                    totalItems = items.size,
                    topCategory = topCategory,
                    leastWornItem = leastWornItem,
                    colorDistribution = colorDistribution
                )

                // Async fetch AI recommendations (optional improvement)
                // This could be a call to a function that summarizes the wardrobe
            } catch (e: Exception) {
                _state.value = InsightsState.Error("Kon statistieken niet laden: ${e.message}")
            }
        }
    }
}
