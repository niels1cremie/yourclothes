package com.yourclothes.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb

// Color schemes
object AppColors {
    val Gold = Color(0xFFD4AF37)
    val Ink = Color(0xFF1A1A1A)
    val Background = Color(0xFFF7F5F2)
    val Surface = Color(0xFFFFFFFF)
    val Muted = Color(0xFF6B7280)
    
    // Blue scheme
    val BluePrimary = Color(0xFF2196F3)
    val BlueSecondary = Color(0xFF1976D2)
    
    // Green scheme
    val GreenPrimary = Color(0xFF4CAF50)
    val GreenSecondary = Color(0xFF388E3C)
    
    // Purple scheme
    val PurplePrimary = Color(0xFF9C27B0)
    val PurpleSecondary = Color(0xFF7B1FA2)
    
    // Orange scheme
    val OrangePrimary = Color(0xFFFF9800)
    val OrangeSecondary = Color(0xFFF57C00)
}

private val LightColorScheme = lightColorScheme(
    primary = AppColors.Gold,
    onPrimary = AppColors.Ink,
    secondary = AppColors.Ink,
    onSecondary = AppColors.Gold,
    background = AppColors.Background,
    surface = AppColors.Surface,
    onSurface = AppColors.Ink,
    onSurfaceVariant = AppColors.Muted
)

private val DarkColorScheme = darkColorScheme(
    primary = AppColors.Gold,
    onPrimary = AppColors.Ink,
    secondary = AppColors.Gold,
    onSecondary = AppColors.Ink,
    background = Color(0xFF121212),
    surface = Color(0xFF1E1E1E),
    onSurface = Color(0xFFE0E0E0),
    onSurfaceVariant = Color(0xFFA0A0A0)
)

private fun createColorScheme(primary: Color, secondary: Color) = lightColorScheme(
    primary = primary,
    onPrimary = AppColors.Ink,
    secondary = secondary,
    onSecondary = AppColors.Ink,
    background = AppColors.Background,
    surface = AppColors.Surface,
    onSurface = AppColors.Ink,
    onSurfaceVariant = AppColors.Muted
)

private fun createDarkColorScheme(primary: Color, secondary: Color) = darkColorScheme(
    primary = primary,
    onPrimary = AppColors.Ink,
    secondary = secondary,
    onSecondary = AppColors.Ink,
    background = Color(0xFF121212),
    surface = Color(0xFF1E1E1E),
    onSurface = Color(0xFFE0E0E0),
    onSurfaceVariant = Color(0xFFA0A0A0)
)

@Composable
fun MirrorTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    colorScheme: androidx.compose.material3.ColorScheme = if (darkTheme) DarkColorScheme else LightColorScheme,
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = colorScheme,
        typography = androidx.compose.material3.Typography(),
        content = content
    )
}

