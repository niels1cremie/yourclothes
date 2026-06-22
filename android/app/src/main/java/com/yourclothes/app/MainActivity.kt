package com.yourclothes.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.navigation.compose.rememberNavController
import com.yourclothes.app.data.*
import com.yourclothes.app.ui.navigation.AppNavigation
import com.yourclothes.app.ui.theme.AppColors
import com.yourclothes.app.ui.theme.MirrorTheme
import com.yourclothes.app.ui.settings.SettingsViewModel
import com.yourclothes.app.ui.settings.SettingsState

class MainActivity : ComponentActivity() {
    private val authRepository = AuthRepository()
    private val wardrobeRepository = WardrobeRepository()
    private val aiRepository = AIRepository()
    private val plannerRepository = PlannerRepository()
    private val profileRepository by lazy { ProfileRepository(this) }
    private val settingsRepository by lazy { SettingsRepository(this) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
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
                colorScheme = when (settingsState) {
                    is SettingsState.Loaded -> {
                        if (isSystemDark) {
                            darkColorScheme(primary = AppColors.Gold)
                        } else {
                            lightColorScheme(primary = AppColors.Gold)
                        }
                    }
                    else -> lightColorScheme(primary = AppColors.Gold)
                }
            ) {
                MainApp(authRepository, wardrobeRepository, aiRepository, plannerRepository, profileRepository, settingsRepository)
            }
        }
    }
}

@Composable
fun MainApp(
    authRepository: AuthRepository,
    wardrobeRepository: WardrobeRepository,
    aiRepository: AIRepository,
    plannerRepository: PlannerRepository,
    profileRepository: ProfileRepository,
    settingsRepository: SettingsRepository
) {
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
