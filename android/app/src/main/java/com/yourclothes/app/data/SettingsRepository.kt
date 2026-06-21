package com.yourclothes.app.data

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

enum class AppTheme {
    LIGHT,
    DARK,
    SYSTEM
}

enum class ColorScheme {
    DEFAULT,
    BLUE,
    GREEN,
    PURPLE,
    ORANGE
}

enum class Language {
    NEDERLANDS,
    ENGLISH
}

data class AppSettings(
    val theme: AppTheme = AppTheme.SYSTEM,
    val colorScheme: ColorScheme = ColorScheme.DEFAULT,
    val language: Language = Language.NEDERLANDS,
    val enableNotifications: Boolean = false,
    val largeTextEnabled: Boolean = false
)

class SettingsRepository(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences(
        "app_settings",
        Context.MODE_PRIVATE
    )

    companion object {
        private const val KEY_THEME = "theme"
        private const val KEY_COLOR_SCHEME = "color_scheme"
        private const val KEY_LANGUAGE = "language"
        private const val KEY_NOTIFICATIONS = "notifications"
        private const val KEY_LARGE_TEXT = "large_text"
    }

    fun getSettings(): AppSettings {
        val theme = when (prefs.getString(KEY_THEME, null)) {
            "light" -> AppTheme.LIGHT
            "dark" -> AppTheme.DARK
            else -> AppTheme.SYSTEM
        }
        
        val colorScheme = when (prefs.getString(KEY_COLOR_SCHEME, null)) {
            "blue" -> ColorScheme.BLUE
            "green" -> ColorScheme.GREEN
            "purple" -> ColorScheme.PURPLE
            "orange" -> ColorScheme.ORANGE
            else -> ColorScheme.DEFAULT
        }

        val language = when (prefs.getString(KEY_LANGUAGE, null)) {
            "english" -> Language.ENGLISH
            else -> Language.NEDERLANDS
        }

        val enableNotifications = prefs.getBoolean(KEY_NOTIFICATIONS, false)
        val largeTextEnabled = prefs.getBoolean(KEY_LARGE_TEXT, false)
        
        return AppSettings(theme, colorScheme, language, enableNotifications, largeTextEnabled)
    }

    suspend fun saveTheme(theme: AppTheme) = withContext(Dispatchers.IO) {
        prefs.edit().putString(KEY_THEME, theme.name.lowercase()).apply()
    }

    suspend fun saveColorScheme(colorScheme: ColorScheme) = withContext(Dispatchers.IO) {
        prefs.edit().putString(KEY_COLOR_SCHEME, colorScheme.name.lowercase()).apply()
    }

    suspend fun saveLanguage(language: Language) = withContext(Dispatchers.IO) {
        prefs.edit().putString(KEY_LANGUAGE, language.name.lowercase()).apply()
    }

    suspend fun saveNotificationsEnabled(enabled: Boolean) = withContext(Dispatchers.IO) {
        prefs.edit().putBoolean(KEY_NOTIFICATIONS, enabled).apply()
    }

    suspend fun saveLargeTextEnabled(enabled: Boolean) = withContext(Dispatchers.IO) {
        prefs.edit().putBoolean(KEY_LARGE_TEXT, enabled).apply()
    }

    suspend fun saveSettings(settings: AppSettings) = withContext(Dispatchers.IO) {
        prefs.edit()
            .putString(KEY_THEME, settings.theme.name.lowercase())
            .putString(KEY_COLOR_SCHEME, settings.colorScheme.name.lowercase())
            .putString(KEY_LANGUAGE, settings.language.name.lowercase())
            .putBoolean(KEY_NOTIFICATIONS, settings.enableNotifications)
            .putBoolean(KEY_LARGE_TEXT, settings.largeTextEnabled)
            .apply()
    }
}
