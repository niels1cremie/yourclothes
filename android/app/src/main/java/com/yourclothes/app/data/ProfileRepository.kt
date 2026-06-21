package com.yourclothes.app.data

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable

@Serializable
data class UserProfile(
    val id: String,
    val first_name: String? = null,
    val last_name: String? = null,
    val date_of_birth: String? = null,
    val age: Int? = null,
    val gender: String? = null,
    val body_shape: String? = null,
    val skin_undertone: String? = null,
    val color_season: String? = null,
    val onboarding_completed: Boolean = false
)

class ProfileRepository(context: Context) {
    private val client = SupabaseClient.client
    private val TAG = "ProfileRepository"
    
    // SharedPreferences for backup onboarding state
    private val sharedPrefs: SharedPreferences = context.getSharedPreferences(
        "onboarding_prefs",
        Context.MODE_PRIVATE
    )
    
    companion object {
        private const val KEY_ONBOARDING_COMPLETED = "onboarding_completed"
        private const val KEY_USER_ID = "user_id"
    }

    suspend fun getProfile(userId: String): UserProfile? = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Fetching profile for user: $userId")
            val profile = client.postgrest["profiles"]
                .select {
                    filter { eq("id", userId) }
                }
                .decodeSingleOrNull<UserProfile>()
            
            Log.d(TAG, "Profile fetch result: ${if (profile != null) "Found - onboarding: ${profile.onboarding_completed}" else "Not found"}")
            profile
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching profile for user $userId", e)
            null
        }
    }

    suspend fun updateProfile(profile: UserProfile): Boolean = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Updating profile for user: ${profile.id}, onboarding_completed: ${profile.onboarding_completed}")
            
            val result = client.postgrest["profiles"]
                .upsert(profile) {
                    select()
                }
                .decodeSingleOrNull<UserProfile>()
            
            val success = result != null
            Log.d(TAG, "Profile update result: ${if (success) "Success" else "Failed"}, onboarding_completed: ${result?.onboarding_completed}")
            
            // Update SharedPreferences as backup
            if (success && profile.onboarding_completed) {
                setOnboardingCompletedLocally(profile.id, true)
            }
            
            success
        } catch (e: Exception) {
            Log.e(TAG, "Error updating profile for user ${profile.id}", e)
            false
        }
    }

    suspend fun ensureOnboardingCompleted(userId: String): Boolean = withContext(Dispatchers.IO) {
        try {
            // First, try to get existing profile
            val existingProfile = getProfile(userId)
            
            if (existingProfile != null && existingProfile.onboarding_completed) {
                Log.d(TAG, "User $userId already completed onboarding")
                setOnboardingCompletedLocally(userId, true)
                return@withContext true
            }
            
            // If profile doesn't exist or onboarding not completed, update it
            val profileToUpdate = existingProfile?.copy(onboarding_completed = true) 
                ?: UserProfile(id = userId, onboarding_completed = true)
            
            val result = updateProfile(profileToUpdate)
            Log.d(TAG, "Ensured onboarding completion for user $userId: $result")
            result
        } catch (e: Exception) {
            Log.e(TAG, "Error ensuring onboarding completion for user $userId", e)
            false
        }
    }
    
    // SharedPreferences backup methods
    fun isOnboardingCompletedLocally(userId: String): Boolean {
        val savedUserId = sharedPrefs.getString(KEY_USER_ID, null)
        val onboardingCompleted = sharedPrefs.getBoolean(KEY_ONBOARDING_COMPLETED, false)
        
        // Only return true if it's for the same user
        return savedUserId == userId && onboardingCompleted
    }
    
    fun setOnboardingCompletedLocally(userId: String, completed: Boolean) {
        sharedPrefs.edit()
            .putString(KEY_USER_ID, userId)
            .putBoolean(KEY_ONBOARDING_COMPLETED, completed)
            .apply()
        Log.d(TAG, "Set onboarding completed locally for user $userId: $completed")
    }
    
    fun clearOnboardingState() {
        sharedPrefs.edit()
            .clear()
            .apply()
        Log.d(TAG, "Cleared onboarding state")
    }
}
