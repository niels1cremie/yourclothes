package com.yourclothes.app.ui.planner

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.yourclothes.app.data.AuthRepository
import com.yourclothes.app.data.OccasionTemplate
import com.yourclothes.app.data.PlannedOutfit
import com.yourclothes.app.data.PlannerRepository
import com.yourclothes.app.data.WardrobeItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.format.DateTimeFormatter

sealed class PlannerState {
    object Loading : PlannerState()
    data class Success(val outfit: PlannedOutfit?) : PlannerState()
    data class Error(val message: String) : PlannerState()
}

sealed class OutfitCreationState {
    object Idle : OutfitCreationState()
    object Loading : OutfitCreationState()
    data class SelectingItems(val selectedItems: List<WardrobeItem>) : OutfitCreationState()
    data class Success(val outfit: PlannedOutfit) : OutfitCreationState()
    data class Error(val message: String) : OutfitCreationState()
}

class PlannerViewModel(
    private val plannerRepository: PlannerRepository,
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _selectedDate = MutableStateFlow(LocalDate.now())
    val selectedDate: StateFlow<LocalDate> = _selectedDate

    private val _state = MutableStateFlow<PlannerState>(PlannerState.Loading)
    val state: StateFlow<PlannerState> = _state

    private val _outfitCreationState = MutableStateFlow<OutfitCreationState>(OutfitCreationState.Idle)
    val outfitCreationState: StateFlow<OutfitCreationState> = _outfitCreationState

    private val _weekOutfits = MutableStateFlow<List<PlannedOutfit>>(emptyList())
    val weekOutfits: StateFlow<List<PlannedOutfit>> = _weekOutfits

    private val _occasionTemplates = MutableStateFlow<List<OccasionTemplate>>(emptyList())
    val occasionTemplates: StateFlow<List<OccasionTemplate>> = _occasionTemplates

    private val dateFormatter = DateTimeFormatter.ISO_DATE

    init {
        loadOutfitForDate(LocalDate.now())
        loadWeekOutfits()
        loadOccasionTemplates()
    }

    fun selectDate(date: LocalDate) {
        _selectedDate.value = date
        loadOutfitForDate(date)
    }

    fun navigateWeek(direction: Int) {
        val newDate = _selectedDate.value.plusWeeks(direction.toLong())
        _selectedDate.value = newDate
        loadOutfitForDate(newDate)
        loadWeekOutfits()
    }

    private fun loadOutfitForDate(date: LocalDate) {
        viewModelScope.launch {
            _state.value = PlannerState.Loading
            val user = authRepository.getCurrentUser()
            if (user != null) {
                val formattedDate = date.format(dateFormatter)
                val outfit = plannerRepository.getPlannedOutfits(user.id, formattedDate)
                _state.value = PlannerState.Success(outfit)
            } else {
                _state.value = PlannerState.Error("Niet ingelogd")
            }
        }
    }

    private fun loadWeekOutfits() {
        viewModelScope.launch {
            val user = authRepository.getCurrentUser()
            if (user != null) {
                val startOfWeek = _selectedDate.value.minusDays(_selectedDate.value.dayOfWeek.value.toLong() - 1)
                val outfits = plannerRepository.getPlannedOutfitsForWeek(user.id, startOfWeek)
                _weekOutfits.value = outfits
            }
        }
    }

    private fun loadOccasionTemplates() {
        viewModelScope.launch {
            val templates = plannerRepository.getOccasionTemplates()
            _occasionTemplates.value = templates
        }
    }

    fun startCreatingOutfit() {
        _outfitCreationState.value = OutfitCreationState.SelectingItems(emptyList())
    }

    fun selectWardrobeItem(item: WardrobeItem) {
        val currentState = _outfitCreationState.value
        if (currentState is OutfitCreationState.SelectingItems) {
            val selectedItems = currentState.selectedItems.toMutableList()
            if (selectedItems.contains(item)) {
                selectedItems.remove(item)
            } else {
                selectedItems.add(item)
            }
            _outfitCreationState.value = OutfitCreationState.SelectingItems(selectedItems)
        }
    }

    fun createOutfit(occasion: String, notes: String? = null, weatherCondition: String? = null) {
        viewModelScope.launch {
            val currentState = _outfitCreationState.value
            if (currentState is OutfitCreationState.SelectingItems && currentState.selectedItems.isNotEmpty()) {
                _outfitCreationState.value = OutfitCreationState.Loading
                
                val user = authRepository.getCurrentUser()
                if (user != null) {
                    val formattedDate = _selectedDate.value.format(dateFormatter)
                    val newOutfit = PlannedOutfit(
                        userId = user.id,
                        date = formattedDate,
                        occasion = occasion,
                        items = currentState.selectedItems,
                        notes = notes,
                        weatherCondition = weatherCondition
                    )

                    val result = plannerRepository.createPlannedOutfit(newOutfit)
                    if (result != null) {
                        _outfitCreationState.value = OutfitCreationState.Success(result)
                        loadOutfitForDate(_selectedDate.value)
                        loadWeekOutfits()
                    } else {
                        _outfitCreationState.value = OutfitCreationState.Error("Kon outfit niet aanmaken")
                    }
                } else {
                    _outfitCreationState.value = OutfitCreationState.Error("Niet ingelogd")
                }
            } else {
                _outfitCreationState.value = OutfitCreationState.Error("Selecteer tenminste één kledingstuk")
            }
        }
    }

    fun updateOutfit(outfit: PlannedOutfit) {
        viewModelScope.launch {
            _state.value = PlannerState.Loading
            val result = plannerRepository.updatePlannedOutfit(outfit)
            if (result != null) {
                _state.value = PlannerState.Success(result)
                loadWeekOutfits()
            } else {
                _state.value = PlannerState.Error("Kon outfit niet bijwerken")
            }
        }
    }

    fun deleteOutfit(outfitId: String) {
        viewModelScope.launch {
            _state.value = PlannerState.Loading
            val success = plannerRepository.deletePlannedOutfit(outfitId)
            if (success) {
                loadOutfitForDate(_selectedDate.value)
                loadWeekOutfits()
            } else {
                _state.value = PlannerState.Error("Kon outfit niet verwijderen")
            }
        }
    }

    fun cancelOutfitCreation() {
        _outfitCreationState.value = OutfitCreationState.Idle
    }

    fun resetOutfitCreationState() {
        _outfitCreationState.value = OutfitCreationState.Idle
    }
}
