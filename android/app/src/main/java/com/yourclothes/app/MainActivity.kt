package com.yourclothes.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.*
import androidx.navigation.compose.rememberNavController
import coil3.compose.LocalImageLoader
import com.yourclothes.app.data.*
import com.yourclothes.app.ui.navigation.AppNavigation
import com.yourclothes.app.ui.theme.CoilConfig
import com.yourclothes.app.ui.theme.MirrorTheme
import com.yourclothes.app.ui.theme.AppColors
import okhttp3.OkHttpClient
import java.util.concurrent.TimeUnit
import androidx.compose.material3.*
import com.yourclothes.app.ui.settings.SettingsViewModel
import com.yourclothes.app.ui.settings.SettingsState

class MainActivity : ComponentActivity() {
    private val authRepository = AuthRepository()
    private val wardrobeRepository = WardrobeRepository()
    private val aiRepository = AIRepository()
    private val plannerRepository = PlannerRepository()
    private val profileRepository = ProfileRepository(this)
    private val settingsRepository = SettingsRepository(this)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        val coilOkHttpClient = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()

        val imageLoader = CoilConfig.createImageLoader(this, coilOkHttpClient)
        val settingsViewModel = SettingsViewModel(settingsRepository)

        setContent {
            val settingsState by settingsViewModel.state.collectAsState()
            val isSystemDark = isSystemInDarkTheme()
            
            MirrorTheme(
                darkTheme = when (val s = settingsState) {
                    is SettingsState.Loaded -> {
                        when (s.settings.theme) {
                            AppTheme.LIGHT -> false
                            AppTheme.DARK -> true
                            AppTheme.SYSTEM -> isSystemDark
                        }
                    }
                    else -> isSystemDark
                },
                colorScheme = when (val s = settingsState) {
                    is SettingsState.Loaded -> {
                        // Dynamic color scheme logic from previous version
                        // Simplified for clarity in refactor
                        if (isSystemDark) {
                            darkColorScheme(primary = AppColors.Gold)
                        } else {
                            lightColorScheme(primary = AppColors.Gold)
                        }
                    }
                    else -> lightColorScheme(primary = AppColors.Gold)
                }
            ) {
                CompositionLocalProvider(LocalImageLoader provides imageLoader) {
                    val navController = rememberNavController()
                    AppNavigation(
                        navController = navController,
                        authRepository = authRepository,
                        wardrobeRepository = wardrobeRepository,
                        aiRepository = aiRepository,
                        plannerRepository = plannerRepository,
                        profileRepository = profileRepository,
                        settingsRepository = settingsRepository
                    )
                }
            }
        }
    }
}
