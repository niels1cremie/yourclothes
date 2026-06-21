package com.yourclothes.app.ui.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun ProfileScreen(viewModel: ProfileViewModel) {
    val state by viewModel.state.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text(
            "Mijn Profiel",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(32.dp))

        when (val s = state) {
            is ProfileState.Loading -> {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
            }
            is ProfileState.Success -> {
                val p = s.profile
                
                ProfileInfoItem("Voornaam", p.first_name ?: "-")
                ProfileInfoItem("Achternaam", p.last_name ?: "-")
                ProfileInfoItem("Geboortedatum", p.date_of_birth ?: "-")
                
                Spacer(modifier = Modifier.height(32.dp))
                
                Text("AI Insights", style = MaterialTheme.typography.titleLarge)
                Spacer(modifier = Modifier.height(16.dp))
                
                ProfileInfoItem("Lichaamsvorm", p.body_shape ?: "Nog onbekend")
                ProfileInfoItem("Ondertoon", p.skin_undertone ?: "Nog onbekend")
                ProfileInfoItem("Seizoen", p.color_season ?: "Nog onbekend")

                Spacer(modifier = Modifier.weight(1f))
                Spacer(modifier = Modifier.height(32.dp))

                Button(
                    onClick = { /* TODO: Edit logic */ },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Bewerk Profiel")
                }

                TextButton(
                    onClick = { viewModel.signOut() },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
                ) {
                    Icon(Icons.Default.ExitToApp, null)
                    Spacer(modifier = Modifier.width(12.dp))
                    Text("Uitloggen")
                }
            }
            is ProfileState.Error -> {
                Text(s.message)
            }
        }
    }
}

@Composable
fun ProfileInfoItem(label: String, value: String) {
    Column(modifier = Modifier.padding(vertical = 8.dp)) {
        Text(label, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(value, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium)
        Divider(modifier = Modifier.padding(top = 8.dp), thickness = 0.5.dp)
    }
}
