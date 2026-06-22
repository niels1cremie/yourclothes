package com.yourclothes.app.ui.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavDestination.Companion.hasRoute
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

sealed class BottomNavItem(val route: Any, val label: String, val icon: ImageVector, val screenClass: KClass<*>) {
    data object Wardrobe : BottomNavItem(Screen.Wardrobe, "Kast", Icons.Default.PhotoLibrary, Screen.Wardrobe::class)
    data object Planner : BottomNavItem(Screen.Planner, "Planner", Icons.Default.CalendarMonth, Screen.Planner::class)
    data object Scanner : BottomNavItem(Screen.Scanner, "Scan", Icons.Default.AddAPhoto, Screen.Scanner::class)
    data object Insights : BottomNavItem(Screen.Insights, "Insights", Icons.Default.Insights, Screen.Insights::class)
    data object Profile : BottomNavItem(Screen.Profile, "Profiel", Icons.Default.Person, Screen.Profile::class)
}

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

        composable<Screen.Onboarding> {
            OnboardingScreen { _, _, _, _ ->
                navController.navigate(Screen.Main) {
                    popUpTo(Screen.Onboarding) { inclusive = true }
                }
            }
        }

        composable<Screen.Main> {
            MainScaffold(
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
fun MainScaffold(
    authRepository: AuthRepository,
    wardrobeRepository: WardrobeRepository,
    aiRepository: AIRepository,
    plannerRepository: PlannerRepository,
    profileRepository: ProfileRepository,
    settingsRepository: SettingsRepository
) {
    val innerNavController = rememberNavController()
    
    val items = listOf(
        BottomNavItem.Wardrobe,
        BottomNavItem.Planner,
        BottomNavItem.Scanner,
        BottomNavItem.Insights,
        BottomNavItem.Profile
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
                        selected = currentDestination?.hierarchy?.any { it.hasRoute(item.screenClass) } == true,
                        onClick = {
                            innerNavController.navigate(item.route) {
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
                        InsightsViewModel(wardrobeRepository, authRepository, aiRepository)
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
                    ClothingScannerScreen(viewModel, onNavigateBack = {
                        innerNavController.popBackStack()
                    })
                }
            }
        }
    }
}
