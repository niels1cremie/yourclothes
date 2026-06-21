package com.yourclothes.app.ui.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.yourclothes.app.data.AuthRepository
import com.yourclothes.app.data.ProfileRepository
import com.yourclothes.app.data.UserProfile
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class ProfileState {
    object Loading : ProfileState()
    data class Success(val profile: UserProfile) : ProfileState()
    data class Error(val message: String) : ProfileState()
}

class ProfileViewModel(
    private val profileRepository: ProfileRepository,
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _state = MutableStateFlow<ProfileState>(ProfileState.Loading)
    val state: StateFlow<ProfileState> = _state

    init {
        loadProfile()
    }

    fun loadProfile() {
        viewModelScope.launch {
            _state.value = ProfileState.Loading
            val user = authRepository.getCurrentUser()
            if (user != null) {
                val profile = profileRepository.getProfile(user.id)
                if (profile != null) {
                    _state.value = ProfileState.Success(profile)
                } else {
                    _state.value = ProfileState.Error("Profiel niet gevonden")
                }
            } else {
                _state.value = ProfileState.Error("Niet ingelogd")
            }
        }
    }

    fun updateProfile(profile: UserProfile) {
        viewModelScope.launch {
            val success = profileRepository.updateProfile(profile)
            if (success) {
                _state.value = ProfileState.Success(profile)
            } else {
                // Keep old profile but show error (simplified for now)
            }
        }
    }

    fun signOut() {
        viewModelScope.launch {
            authRepository.signOut()
        }
    }
}
