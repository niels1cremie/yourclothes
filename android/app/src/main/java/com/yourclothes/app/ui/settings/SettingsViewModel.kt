package com.yourclothes.app.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.yourclothes.app.data.AppSettings
import com.yourclothes.app.data.AppSettings
import com.yourclothes.app.data.AppTheme
import com.yourclothes.app.data.ColorScheme
import com.yourclothes.app.data.Language
import com.yourclothes.app.data.SettingsRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class SettingsState {
    object Loading : SettingsState()
    data class Loaded(val settings: AppSettings) : SettingsState()
    data class Error(val message: String) : SettingsState()
}

class SettingsViewModel(private val settingsRepository: SettingsRepository) : ViewModel() {

    private val _state = MutableStateFlow<SettingsState>(SettingsState.Loading)
    val state: StateFlow<SettingsState> = _state

    init {
        loadSettings()
    }

    fun loadSettings() {
        viewModelScope.launch {
            try {
                val settings = settingsRepository.getSettings()
                _state.value = SettingsState.Loaded(settings)
            } catch (e: Exception) {
                _state.value = SettingsState.Error("Fout bij laden instellingen: ${e.message}")
            }
        }
    }

    fun updateTheme(theme: AppTheme) {
        viewModelScope.launch {
            try {
                val currentSettings = (_state.value as? SettingsState.Loaded)?.settings ?: return@launch
                val updatedSettings = currentSettings.copy(theme = theme)
                settingsRepository.saveTheme(theme)
                _state.value = SettingsState.Loaded(updatedSettings)
            } catch (e: Exception) {
                _state.value = SettingsState.Error("Fout bij opslaan thema: ${e.message}")
            }
        }
    }

    fun updateColorScheme(colorScheme: ColorScheme) {
        viewModelScope.launch {
            try {
                val currentSettings = (_state.value as? SettingsState.Loaded)?.settings ?: return@launch
                val updatedSettings = currentSettings.copy(colorScheme = colorScheme)
                settingsRepository.saveColorScheme(colorScheme)
                _state.value = SettingsState.Loaded(updatedSettings)
            } catch (e: Exception) {
                _state.value = SettingsState.Error("Fout bij opslaan kleurenschema: ${e.message}")
            }
        }
    }

    fun updateLanguage(language: Language) {
        viewModelScope.launch {
            try {
                val currentSettings = (_state.value as? SettingsState.Loaded)?.settings ?: return@launch
                val updatedSettings = currentSettings.copy(language = language)
                settingsRepository.saveLanguage(language)
                _state.value = SettingsState.Loaded(updatedSettings)
            } catch (e: Exception) {
                _state.value = SettingsState.Error("Fout bij opslaan taal: ${e.message}")
            }
        }
    }

    fun updateNotificationsEnabled(enabled: Boolean) {
        viewModelScope.launch {
            try {
                val currentSettings = (_state.value as? SettingsState.Loaded)?.settings ?: return@launch
                val updatedSettings = currentSettings.copy(enableNotifications = enabled)
                settingsRepository.saveNotificationsEnabled(enabled)
                _state.value = SettingsState.Loaded(updatedSettings)
            } catch (e: Exception) {
                _state.value = SettingsState.Error("Fout bij opslaan notificaties: ${e.message}")
            }
        }
    }

    fun updateLargeTextEnabled(enabled: Boolean) {
        viewModelScope.launch {
            try {
                val currentSettings = (_state.value as? SettingsState.Loaded)?.settings ?: return@launch
                val updatedSettings = currentSettings.copy(largeTextEnabled = enabled)
                settingsRepository.saveLargeTextEnabled(enabled)
                _state.value = SettingsState.Loaded(updatedSettings)
            } catch (e: Exception) {
                _state.value = SettingsState.Error("Fout bij opslaan grote tekst: ${e.message}")
            }
        }
    }
}
