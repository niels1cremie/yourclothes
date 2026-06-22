package com.yourclothes.app.ui.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.yourclothes.app.data.UserProfile
import com.yourclothes.app.ui.components.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(viewModel: ProfileViewModel) {
    val state by viewModel.state.collectAsState()
    var isEditing by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mijn Profiel") },
                actions = {
                    if (state is ProfileState.Success) {
                        IconButton(onClick = { isEditing = !isEditing }) {
                            Icon(if (isEditing) Icons.Default.Person else Icons.Default.Edit, null)
                        }
                    }
                }
            )
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            when (val s = state) {
                is ProfileState.Loading -> LoadingView()
                is ProfileState.Error -> ErrorView(message = s.message, onRetry = { viewModel.loadProfile() })
                is ProfileState.Success -> {
                    if (isEditing) {
                        ProfileEditContent(s.profile, onSave = {
                            viewModel.updateProfile(it)
                            isEditing = false
                        })
                    } else {
                        ProfileDisplayContent(s.profile, onSignOut = { viewModel.signOut() })
                    }
                }
            }
        }
    }
}

@Composable
fun ProfileDisplayContent(profile: UserProfile, onSignOut: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
            Surface(
                modifier = Modifier.size(100.dp),
                shape = androidx.compose.foundation.shape.CircleShape,
                color = MaterialTheme.colorScheme.primaryContainer
            ) {
                Icon(
                    Icons.Default.Person,
                    contentDescription = null,
                    modifier = Modifier.size(64.dp).padding(20.dp),
                    tint = MaterialTheme.colorScheme.primary
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                "${profile.first_name} ${profile.last_name}",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            Text(profile.id, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }

        Spacer(modifier = Modifier.height(40.dp))

        Text("Persoonlijke Details", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(16.dp))

        InfoRow(label = "Geboortedatum", value = profile.date_of_birth ?: "-")
        InfoRow(label = "Geslacht", value = profile.gender ?: "-")

        Spacer(modifier = Modifier.height(32.dp))

        Text("AI Analyse", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Text("Gegevens automatisch gedetecteerd door MIRROR AI", style = MaterialTheme.typography.bodySmall)
        Spacer(modifier = Modifier.height(16.dp))

        InfoRow(label = "Lichaamsvorm", value = profile.body_shape ?: "Scan kleding voor resultaat")
        InfoRow(label = "Ondertoon", value = profile.skin_undertone ?: "-")
        InfoRow(label = "Seizoen", value = profile.color_season ?: "-")

        Spacer(modifier = Modifier.weight(1f))
        Spacer(modifier = Modifier.height(48.dp))

        TextButton(
            onClick = onSignOut,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
        ) {
            Icon(Icons.Default.ExitToApp, null)
            Spacer(modifier = Modifier.width(12.dp))
            Text("Uitloggen")
        }
    }
}

@Composable
fun ProfileEditContent(profile: UserProfile, onSave: (UserProfile) -> Unit) {
    var firstName by remember { mutableStateOf(profile.first_name ?: "") }
    var lastName by remember { mutableStateOf(profile.last_name ?: "") }
    var dob by remember { mutableStateOf(profile.date_of_birth ?: "") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
            .verticalScroll(rememberScrollState())
    ) {
        OutlinedTextField(
            value = firstName,
            onValueChange = { firstName = it },
            label = { Text("Voornaam") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(
            value = lastName,
            onValueChange = { lastName = it },
            label = { Text("Achternaam") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(
            value = dob,
            onValueChange = { dob = it },
            label = { Text("Geboortedatum (JJJJ-MM-DD)") },
            modifier = Modifier.fillMaxWidth()
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Button(
            onClick = {
                onSave(profile.copy(first_name = firstName, last_name = lastName, date_of_birth = dob))
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Opslaan")
        }
    }
}

@Composable
fun InfoRow(label: String, value: String) {
    Column(modifier = Modifier.padding(vertical = 12.dp)) {
        Text(label, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(value, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium)
        Divider(modifier = Modifier.padding(top = 12.dp), thickness = 0.5.dp, color = MaterialTheme.colorScheme.surfaceVariant)
    }
}
