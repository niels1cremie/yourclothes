package com.yourclothes.app.ui.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.yourclothes.app.data.*
import com.yourclothes.app.ui.auth.AuthScreen
import com.yourclothes.app.ui.onboarding.OnboardingScreen
import com.yourclothes.app.ui.planner.PlannerScreen
import com.yourclothes.app.ui.planner.PlannerViewModel
import com.yourclothes.app.ui.settings.SettingsScreen
import com.yourclothes.app.ui.settings.SettingsViewModel
import com.yourclothes.app.ui.wardrobe.WardrobeScreen
import com.yourclothes.app.ui.wardrobe.WardrobeViewModel
import com.yourclothes.app.ui.scanner.ClothingScannerScreen
import com.yourclothes.app.ui.scanner.ScannerViewModel
import com.yourclothes.app.ui.outfit.OutfitGeneratorScreen
import com.yourclothes.app.ui.outfit.OutfitViewModel
import com.yourclothes.app.ui.insights.InsightsScreen
import com.yourclothes.app.ui.insights.InsightsViewModel
import com.yourclothes.app.ui.profile.ProfileScreen
import com.yourclothes.app.ui.profile.ProfileViewModel
import kotlin.reflect.KClass

@Composable
fun AppNavigation(
    navController: NavHostController,
    authRepository: AuthRepository,
    wardrobeRepository: WardrobeRepository,
    aiRepository: AIRepository,
    plannerRepository: PlannerRepository,
    profileRepository: ProfileRepository,
    settingsRepository: SettingsRepository
) {
    val user = authRepository.getCurrentUser()
    val startDestination: Any = if (user == null) Screen.Auth else Screen.Main

    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable<Screen.Auth> {
            AuthScreen(
                authRepository = authRepository,
                onAuthSuccess = {
                    navController.navigate(Screen.Main) {
                        popUpTo(Screen.Auth) { inclusive = true }
                    }
                }
            )
        }

        composable<Screen.Main> {
            MainContainer(
                authRepository,
                wardrobeRepository,
                aiRepository,
                plannerRepository,
                profileRepository,
                settingsRepository
            )
        }
    }
}

@Composable
fun MainContainer(
    authRepository: AuthRepository,
    wardrobeRepository: WardrobeRepository,
    aiRepository: AIRepository,
    plannerRepository: PlannerRepository,
    profileRepository: ProfileRepository,
    settingsRepository: SettingsRepository
) {
    val innerNavController = rememberNavController()
    
    val items = listOf(
        NavigationItem(Screen.Wardrobe, "Kast", Icons.Default.PhotoLibrary, Screen.Wardrobe::class),
        NavigationItem(Screen.Planner, "Planner", Icons.Default.Sparkles, Screen.Planner::class),
        NavigationItem(Screen.OutfitGenerator, "Stijl", Icons.Default.AutoAwesome, Screen.OutfitGenerator::class),
        NavigationItem(Screen.Insights, "Insights", Icons.Default.Insights, Screen.Insights::class),
        NavigationItem(Screen.Profile, "Profiel", Icons.Default.Person, Screen.Profile::class)
    )

    Scaffold(
        bottomBar = {
            NavigationBar {
                val navBackStackEntry by innerNavController.currentBackStackEntryAsState()
                val currentDestination = navBackStackEntry?.destination
                
                items.forEach { item ->
                    NavigationBarItem(
                        icon = { Icon(item.icon, contentDescription = item.label) },
                        label = { Text(item.label) },
                        selected = currentDestination?.hierarchy?.any { it.route?.contains(item.screenClass.simpleName ?: "") == true } == true,
                        onClick = {
                            innerNavController.navigate(item.screen) {
                                popUpTo(innerNavController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            NavHost(
                navController = innerNavController,
                startDestination = Screen.Wardrobe
            ) {
                composable<Screen.Wardrobe> {
                    val viewModel: WardrobeViewModel = viewModel {
                        WardrobeViewModel(wardrobeRepository, authRepository, aiRepository)
                    }
                    WardrobeScreen(viewModel, onNavigateToScanner = {
                        innerNavController.navigate(Screen.Scanner)
                    })
                }
                composable<Screen.Planner> {
                    val viewModel: PlannerViewModel = viewModel {
                        PlannerViewModel(plannerRepository, authRepository)
                    }
                    PlannerScreen(viewModel)
                }
                composable<Screen.OutfitGenerator> {
                    val viewModel: OutfitViewModel = viewModel {
                        OutfitViewModel(wardrobeRepository, authRepository, aiRepository, profileRepository, plannerRepository)
                    }
                    OutfitGeneratorScreen(viewModel)
                }
                composable<Screen.Insights> {
                    val viewModel: InsightsViewModel = viewModel {
                        InsightsViewModel(wardrobeRepository, authRepository)
                    }
                    InsightsScreen(viewModel)
                }
                composable<Screen.Profile> {
                    val viewModel: ProfileViewModel = viewModel {
                        ProfileViewModel(profileRepository, authRepository)
                    }
                    ProfileScreen(viewModel)
                }
                composable<Screen.Settings> {
                    val viewModel: SettingsViewModel = viewModel {
                        SettingsViewModel(settingsRepository)
                    }
                    SettingsScreen(viewModel)
                }
                composable<Screen.Scanner> {
                    val viewModel: ScannerViewModel = viewModel {
                        ScannerViewModel(wardrobeRepository, authRepository, aiRepository)
                    }
                    ClothingScannerScreen(viewModel)
                }
            }
        }
    }
}

data class NavigationItem(
    val screen: Any,
    val label: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
    val screenClass: KClass<*>
)
