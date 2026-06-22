package com.yourclothes.app.ui.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.yourclothes.app.data.*

@Composable
fun SettingsScreen(viewModel: SettingsViewModel) {
    val state by viewModel.state.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text(
            "Instellingen",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(24.dp))

        when (val s = state) {
            is SettingsState.Loading -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            }
            is SettingsState.Error -> {
                Text(
                    s.message,
                    color = MaterialTheme.colorScheme.error
                )
            }
            is SettingsState.Loaded -> {
                SettingsContent(s.settings, viewModel)
            }
        }
    }
}

@Composable
fun SettingsContent(settings: AppSettings, viewModel: SettingsViewModel) {
    // Theme Selection
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.LightMode, contentDescription = null)
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    "Thema",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            AppTheme.entries.forEach { theme ->
                ThemeOption(
                    theme = theme,
                    selected = settings.theme == theme,
                    onClick = { viewModel.updateTheme(theme) }
                )
                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }

    Spacer(modifier = Modifier.height(16.dp))

    // Color Scheme Selection
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.Palette, contentDescription = null)
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    "Kleurenschema",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            com.yourclothes.app.data.ColorScheme.entries.forEach { colorScheme ->
                ColorSchemeOption(
                    colorScheme = colorScheme,
                    selected = settings.colorScheme == colorScheme,
                    onClick = { viewModel.updateColorScheme(colorScheme) }
                )
                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }

    Spacer(modifier = Modifier.height(16.dp))

    // Language Selection
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.Language, contentDescription = null)
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    "Taal",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Language.entries.forEach { language ->
                LanguageOption(
                    language = language,
                    selected = settings.language == language,
                    onClick = { viewModel.updateLanguage(language) }
                )
                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }

    Spacer(modifier = Modifier.height(16.dp))

    // Accessibility Settings
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.TextFormat, contentDescription = null)
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    "Toegankelijkheid",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            SwitchSetting(
                title = "Grote tekst",
                description = "Verhoog de tekstgroot voor betere leesbaarheid",
                checked = settings.largeTextEnabled,
                onCheckedChange = { viewModel.updateLargeTextEnabled(it) }
            )
        }
    }

    Spacer(modifier = Modifier.height(16.dp))

    // Notification Settings
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.Notifications, contentDescription = null)
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    "Notificaties",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            SwitchSetting(
                title = "Push notificaties",
                description = "Ontvang meldingen voor outfit herinneringen",
                checked = settings.enableNotifications,
                onCheckedChange = { viewModel.updateNotificationsEnabled(it) }
            )
        }
    }

    Spacer(modifier = Modifier.height(16.dp))

    // Info Section
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                "App Info",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Medium
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            InfoRow("Versie", "1.0.0")
            HorizontalDivider()
            InfoRow("Build", "Native Android")
        }
    }
}

@Composable
fun ThemeOption(theme: AppTheme, selected: Boolean, onClick: () -> Unit) {
    val title = when (theme) {
        AppTheme.LIGHT -> "Licht"
        AppTheme.DARK -> "Donker"
        AppTheme.SYSTEM -> "Systeemstandaard"
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .selectable(selected = selected, onClick = onClick)
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        RadioButton(
            selected = selected,
            onClick = onClick
        )
        Spacer(modifier = Modifier.width(12.dp))
        Text(title)
    }
}

@Composable
fun ColorSchemeOption(colorScheme: com.yourclothes.app.data.ColorScheme, selected: Boolean, onClick: () -> Unit) {
    val title = when (colorScheme) {
        com.yourclothes.app.data.ColorScheme.DEFAULT -> "Standaard"
        com.yourclothes.app.data.ColorScheme.BLUE -> "Blauw"
        com.yourclothes.app.data.ColorScheme.GREEN -> "Groen"
        com.yourclothes.app.data.ColorScheme.PURPLE -> "Paars"
        com.yourclothes.app.data.ColorScheme.ORANGE -> "Oranje"
    }

    val color = when (colorScheme) {
        com.yourclothes.app.data.ColorScheme.DEFAULT -> MaterialTheme.colorScheme.primary
        com.yourclothes.app.data.ColorScheme.BLUE -> Color(0xFF2196F3)
        com.yourclothes.app.data.ColorScheme.GREEN -> Color(0xFF4CAF50)
        com.yourclothes.app.data.ColorScheme.PURPLE -> Color(0xFF9C27B0)
        com.yourclothes.app.data.ColorScheme.ORANGE -> Color(0xFFFF9800)
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .selectable(selected = selected, onClick = onClick)
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        RadioButton(
            selected = selected,
            onClick = onClick
        )
        Spacer(modifier = Modifier.width(12.dp))
        Box(
            modifier = Modifier.size(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Surface(
                color = color,
                shape = MaterialTheme.shapes.small,
                modifier = Modifier.fillMaxSize()
            ) {}
        }
        Spacer(modifier = Modifier.width(12.dp))
        Text(title)
    }
}

@Composable
fun LanguageOption(language: Language, selected: Boolean, onClick: () -> Unit) {
    val title = when (language) {
        Language.NEDERLANDS -> "Nederlands"
        Language.ENGLISH -> "English"
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .selectable(selected = selected, onClick = onClick)
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        RadioButton(
            selected = selected,
            onClick = onClick
        )
        Spacer(modifier = Modifier.width(12.dp))
        Text(title)
    }
}

@Composable
fun SwitchSetting(
    title: String,
    description: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .selectable(selected = false, onClick = { onCheckedChange(!checked) })
            .padding(vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                title,
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.Medium
            )
            Text(
                description,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange
        )
    }
}

@Composable
fun InfoRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            label,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            value,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Medium
        )
    }
}
