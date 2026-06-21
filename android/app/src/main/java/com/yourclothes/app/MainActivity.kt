package com.yourclothes.app

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Sparkles
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.lifecycleScope
import coil3.ImageLoader
import coil3.compose.LocalImageLoader
import com.yourclothes.app.data.*
import com.yourclothes.app.ui.auth.AuthScreen
import com.yourclothes.app.ui.onboarding.OnboardingScreen
import com.yourclothes.app.ui.planner.PlannerScreen
import com.yourclothes.app.ui.planner.PlannerViewModel
import com.yourclothes.app.ui.settings.SettingsScreen
import com.yourclothes.app.ui.settings.SettingsViewModel
import com.yourclothes.app.ui.theme.CoilConfig
import com.yourclothes.app.ui.theme.MirrorTheme
import com.yourclothes.app.ui.theme.AppColors
import com.yourclothes.app.ui.wardrobe.WardrobeScreen
import com.yourclothes.app.ui.wardrobe.WardrobeViewModel
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import java.util.concurrent.TimeUnit

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
        
        // Configure OkHttp for Coil with original quality settings
        val coilOkHttpClient = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()

        // Create Coil ImageLoader with original quality configuration
        val imageLoader = CoilConfig.createImageLoader(this, coilOkHttpClient)

        val wardrobeViewModel = WardrobeViewModel(wardrobeRepository, authRepository, aiRepository)
        val plannerViewModel = PlannerViewModel(plannerRepository, authRepository)
        val settingsViewModel = SettingsViewModel(settingsRepository)

        setContent {
            val settings by settingsViewModel.state.collectAsState()
            val isSystemDark = isSystemInDarkTheme()
            
            MirrorTheme(
                darkTheme = when (settings) {
                    is com.yourclothes.app.ui.settings.SettingsState.Loaded -> {
                        when ((settings as com.yourclothes.app.ui.settings.SettingsState.Loaded).settings.theme) {
                            com.yourclothes.app.data.AppTheme.LIGHT -> false
                            com.yourclothes.app.data.AppTheme.DARK -> true
                            com.yourclothes.app.data.AppTheme.SYSTEM -> isSystemDark
                        }
                    }
                    else -> isSystemDark
                },
                colorScheme = when (settings) {
                    is com.yourclothes.app.ui.settings.SettingsState.Loaded -> {
                        when ((settings as com.yourclothes.app.ui.settings.SettingsState.Loaded).settings.colorScheme) {
                            com.yourclothes.app.data.ColorScheme.DEFAULT -> if (isSystemDark) {
                                androidx.compose.material3.darkColorScheme(
                                    primary = AppColors.Gold,
                                    onPrimary = AppColors.Ink,
                                    secondary = AppColors.Gold,
                                    onSecondary = AppColors.Ink
                                )
                            } else {
                                androidx.compose.material3.lightColorScheme(
                                    primary = AppColors.Gold,
                                    onPrimary = AppColors.Ink,
                                    secondary = AppColors.Ink,
                                    onSecondary = AppColors.Gold
                                )
                            }
                            com.yourclothes.app.data.ColorScheme.BLUE -> if (isSystemDark) {
                                androidx.compose.material3.darkColorScheme(
                                    primary = AppColors.BluePrimary,
                                    onPrimary = AppColors.Ink,
                                    secondary = AppColors.BlueSecondary
                                )
                            } else {
                                androidx.compose.material3.lightColorScheme(
                                    primary = AppColors.BluePrimary,
                                    onPrimary = AppColors.Ink,
                                    secondary = AppColors.BlueSecondary
                                )
                            }
                            com.yourclothes.app.data.ColorScheme.GREEN -> if (isSystemDark) {
                                androidx.compose.material3.darkColorScheme(
                                    primary = AppColors.GreenPrimary,
                                    onPrimary = AppColors.Ink,
                                    secondary = AppColors.GreenSecondary
                                )
                            } else {
                                androidx.compose.material3.lightColorScheme(
                                    primary = AppColors.GreenPrimary,
                                    onPrimary = AppColors.Ink,
                                    secondary = AppColors.GreenSecondary
                                )
                            }
                            com.yourclothes.app.data.ColorScheme.PURPLE -> if (isSystemDark) {
                                androidx.compose.material3.darkColorScheme(
                                    primary = AppColors.PurplePrimary,
                                    onPrimary = AppColors.Ink,
                                    secondary = AppColors.PurpleSecondary
                                )
                            } else {
                                androidx.compose.material3.lightColorScheme(
                                    primary = AppColors.PurplePrimary,
                                    onPrimary = AppColors.Ink,
                                    secondary = AppColors.PurpleSecondary
                                )
                            }
                            com.yourclothes.app.data.ColorScheme.ORANGE -> if (isSystemDark) {
                                androidx.compose.material3.darkColorScheme(
                                    primary = AppColors.OrangePrimary,
                                    onPrimary = AppColors.Ink,
                                    secondary = AppColors.OrangeSecondary
                                )
                            } else {
                                androidx.compose.material3.lightColorScheme(
                                    primary = AppColors.OrangePrimary,
                                    onPrimary = AppColors.Ink,
                                    secondary = AppColors.OrangeSecondary
                                )
                            }
                        }
                    }
                    else -> androidx.compose.material3.lightColorScheme(
                        primary = AppColors.Gold,
                        onPrimary = AppColors.Ink,
                        secondary = AppColors.Ink,
                        onSecondary = AppColors.Gold
                    )
                }
            ) {
                // Provide the configured ImageLoader to the composition
                CompositionLocalProvider(LocalImageLoader provides imageLoader) {
                    var currentUser by remember { mutableStateOf(authRepository.getCurrentUser()) }
                    var showOnboarding by remember { mutableStateOf(true) } // Default to true until we check
                    var isAIProcessing by remember { mutableStateOf(false) }
                    var isLoadingProfile by remember { mutableStateOf(true) }

                    LaunchedEffect(currentUser) {
                        val user = currentUser
                        if (user != null) {
                            // Reload data for the new user
                            wardrobeViewModel.loadItems()
                            plannerViewModel.selectDate(java.time.LocalDate.now())

                            isLoadingProfile = true
                            try {
                                val profile = profileRepository.getProfile(user.id)
                                // Check both database and local storage
                                val dbOnboardingComplete = profile != null && profile.onboarding_completed
                                val localOnboardingComplete = profileRepository.isOnboardingCompletedLocally(user.id)
                                
                                // Show onboarding only if neither source says it's completed
                                showOnboarding = !dbOnboardingComplete && !localOnboardingComplete
                                
                                Log.d("MainActivity", "Onboarding check - DB: $dbOnboardingComplete, Local: $localOnboardingComplete, Show: $showOnboarding")
                            } catch (e: Exception) {
                                Log.e("MainActivity", "Error loading profile", e)
                                // If we can't load the profile, check local storage as fallback
                                val localOnboardingComplete = profileRepository.isOnboardingCompletedLocally(user.id)
                                showOnboarding = !localOnboardingComplete
                                Log.d("MainActivity", "Using local storage fallback: $localOnboardingComplete")
                            } finally {
                                isLoadingProfile = false
                            }
                        } else {
                            // User is not logged in
                            showOnboarding = false
                            isLoadingProfile = false
                        }
                    }

                    if (currentUser == null) {
                        AuthScreen(
                            authRepository = authRepository,
                            onAuthSuccess = {
                                currentUser = authRepository.getCurrentUser()
                            }
                        )
                    } else if (isLoadingProfile) {
                        // Loading profile state
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = androidx.compose.ui.Alignment.Center) {
                            Column(horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally) {
                                CircularProgressIndicator()
                                Spacer(modifier = Modifier.height(16.dp))
                                Text("Laden...")
                            }
                        }
                    } else if (isAIProcessing) {
                        // AI Processing state
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = androidx.compose.ui.Alignment.Center) {
                            Column(horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally) {
                                CircularProgressIndicator()
                                Spacer(modifier = Modifier.height(16.dp))
                                Text("MIRROR AI stelt je digitale profiel samen...")
                            }
                        }
                    } else if (showOnboarding) {
                        // Show onboarding
                        val user = currentUser!!
                        OnboardingScreen { first, last, dob, photoUri ->
                            lifecycleScope.launch {
                                isAIProcessing = true
                                try {
                                    // 1. AI Analysis based on profile data
                                    val aiResult = aiRepository.analyzeUser(
                                        UserAnalysisRequest(
                                            firstName = first,
                                            lastName = last,
                                            dateOfBirth = dob,
                                            fullBodyImageUrl = photoUri?.toString()
                                        )
                                    )

                                    val result = aiResult.getOrNull()
                                    
                                    // 2. Update profile with AI insights
                                    val updateSuccess = profileRepository.updateProfile(UserProfile(
                                        id = user.id,
                                        first_name = first,
                                        last_name = last,
                                        date_of_birth = dob,
                                        body_shape = result?.bodyShape,
                                        skin_undertone = result?.skinUndertone,
                                        color_season = result?.colorSeason,
                                        onboarding_completed = true
                                    ))
                                    
                                    if (updateSuccess) {
                                        // Set onboarding to false and reload profile to confirm
                                        showOnboarding = false
                                        
                                        // Verify the profile was saved correctly
                                        val savedProfile = profileRepository.getProfile(user.id)
                                        Log.d("MainActivity", "Profile saved successfully. Onboarding completed: ${savedProfile?.onboarding_completed}")
                                    } else {
                                        Log.e("MainActivity", "Failed to save profile, but setting onboarding to false to prevent loop")
                                        // Even if save fails, set onboarding to false to prevent infinite loop
                                        showOnboarding = false
                                    }
                                    
                                } catch (e: Exception) {
                                    Log.e("MainActivity", "AI Onboarding error", e)
                                    // Fallback: save without AI
                                    try {
                                        val fallbackSuccess = profileRepository.updateProfile(UserProfile(
                                            id = user.id,
                                            first_name = first,
                                            last_name = last,
                                            date_of_birth = dob,
                                            onboarding_completed = true
                                        ))
                                        
                                        if (fallbackSuccess) {
                                            // Set onboarding to false and verify
                                            showOnboarding = false
                                            val savedProfile = profileRepository.getProfile(user.id)
                                            Log.d("MainActivity", "Fallback profile saved successfully. Onboarding completed: ${savedProfile?.onboarding_completed}")
                                        } else {
                                            Log.e("MainActivity", "Fallback profile save failed, but setting onboarding to false")
                                            showOnboarding = false
                                        }
                                        
                                    } catch (innerE: Exception) {
                                        Log.e("MainActivity", "Fallback save error", innerE)
                                        // Even if save fails, don't show onboarding again to prevent infinite loop
                                        showOnboarding = false
                                    }
                                } finally {
                                    isAIProcessing = false
                                }
                            }
                        }
                    } else {
                        // User logged in and onboarding completed - show main app
                        MainContainer(wardrobeViewModel, plannerViewModel, settingsViewModel)
                    }
                }
            }
        }
    }
}

@Composable
fun MainContainer(
    wardrobeViewModel: WardrobeViewModel,
    plannerViewModel: PlannerViewModel,
    settingsViewModel: SettingsViewModel
) {
    var selectedTab by remember { mutableIntStateOf(0) }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    icon = { Icon(Icons.Default.PhotoLibrary, "Kast") },
                    label = { Text("Kast") },
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Sparkles, "Planner") },
                    label = { Text("Planner") },
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Settings, "Profiel") },
                    label = { Text("Profiel") },
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 }
                )
            }
        }
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            when (selectedTab) {
                0 -> WardrobeScreen(wardrobeViewModel)
                1 -> PlannerScreen(plannerViewModel)
                2 -> SettingsScreen(settingsViewModel)
            }
        }
    }
}
