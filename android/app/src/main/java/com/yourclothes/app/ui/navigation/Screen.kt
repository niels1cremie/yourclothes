package com.yourclothes.app.ui.navigation

import kotlinx.serialization.Serializable

sealed interface Screen {
    @Serializable
    data object Auth : Screen

    @Serializable
    data object Onboarding : Screen

    @Serializable
    data object Main : Screen

    @Serializable
    data object Wardrobe : Screen

    @Serializable
    data object Planner : Screen

    @Serializable
    data object Scanner : Screen

    @Serializable
    data object OutfitGenerator : Screen

    @Serializable
    data object Insights : Screen

    @Serializable
    data object Profile : Screen

    @Serializable
    data object Settings : Screen
}
