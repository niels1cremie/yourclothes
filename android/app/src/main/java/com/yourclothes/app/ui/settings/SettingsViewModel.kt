package com.yourclothes.app.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.yourclothes.app.data.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class SettingsState {
    object Loading : SettingsState()
    data class Loaded(val settings: AppSettings) : SettingsState()
    data class Error(val message: String) : SettingsState()
}

class SettingsViewModel(
    private val settingsRepository: SettingsRepository
) : ViewModel() {

    private val _state = MutableStateFlow<SettingsState>(SettingsState.Loading)
    val state: StateFlow<SettingsState> = _state

    init {
        loadSettings()
    }

    fun loadSettings() {
        viewModelScope.launch {
            _state.value = SettingsState.Loading
            try {
                val settings = settingsRepository.getSettings()
                _state.value = SettingsState.Loaded(settings)
            } catch (e: Exception) {
                _state.value = SettingsState.Error("Fout bij laden instellingen")
            }
        }
    }

    fun updateTheme(theme: AppTheme) {
        viewModelScope.launch {
            settingsRepository.saveTheme(theme)
            loadSettings()
        }
    }

    fun updateColorScheme(colorScheme: com.yourclothes.app.data.ColorScheme) {
        viewModelScope.launch {
            settingsRepository.saveColorScheme(colorScheme)
            loadSettings()
        }
    }

    fun updateLanguage(language: Language) {
        viewModelScope.launch {
            settingsRepository.saveLanguage(language)
            loadSettings()
        }
    }

    fun updateNotificationsEnabled(enabled: Boolean) {
        viewModelScope.launch {
            settingsRepository.saveNotificationsEnabled(enabled)
            loadSettings()
        }
    }

    fun updateLargeTextEnabled(enabled: Boolean) {
        viewModelScope.launch {
            settingsRepository.saveLargeTextEnabled(enabled)
            loadSettings()
        }
    }
}
