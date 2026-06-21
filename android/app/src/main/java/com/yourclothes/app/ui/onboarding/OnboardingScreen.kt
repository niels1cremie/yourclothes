package com.yourclothes.app.ui.onboarding

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import coil3.request.ImageRequest
import coil3.size.Scale
import coil3.size.Size
import kotlinx.coroutines.launch

@Composable
fun OnboardingScreen(onComplete: (String, String, String, Uri?) -> Unit) {
    var step by remember { mutableIntStateOf(0) }
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var birthDate by remember { mutableStateOf("") }
    var photoUri by remember { mutableStateOf<Uri?>(null) }
    val context = LocalContext.current

    // Photo picker launcher
    val photoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
        onResult = { uri ->
            if (uri != null) {
                photoUri = uri
            }
        }
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Stel je profiel in", style = MaterialTheme.typography.titleMedium) },
                navigationIcon = {
                    if (step > 0) {
                        IconButton(onClick = { step-- }) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Terug")
                        }
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .padding(24.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            LinearProgressIndicator(
                progress = { (step + 1) / 4f },
                modifier = Modifier.fillMaxWidth().height(8.dp),
                color = MaterialTheme.colorScheme.primary,
                trackColor = MaterialTheme.colorScheme.surfaceVariant
            )

            Spacer(modifier = Modifier.height(32.dp))

            AnimatedContent(targetState = step, label = "OnboardingSteps") { currentStep ->
                Column(horizontalAlignment = Alignment.Start) {
                    when (currentStep) {
                        0 -> {
                            Text("Hoe mogen we je noemen?", style = MaterialTheme.typography.headlineLarge)
                            Spacer(modifier = Modifier.height(24.dp))
                            OutlinedTextField(
                                value = firstName,
                                onValueChange = { firstName = it },
                                label = { Text("Voornaam") },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true
                            )
                        }
                        1 -> {
                            Text("Wat is je achternaam?", style = MaterialTheme.typography.headlineLarge)
                            Spacer(modifier = Modifier.height(24.dp))
                            OutlinedTextField(
                                value = lastName,
                                onValueChange = { lastName = it },
                                label = { Text("Achternaam") },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true
                            )
                        }
                        2 -> {
                            Text("Wanneer ben je geboren?", style = MaterialTheme.typography.headlineLarge)
                            Spacer(modifier = Modifier.height(24.dp))
                            OutlinedTextField(
                                value = birthDate,
                                onValueChange = { birthDate = it },
                                label = { Text("Geboortedatum (JJJJ-MM-DD)") },
                                placeholder = { Text("1990-01-01") },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true
                            )
                        }
                        3 -> {
                            Text("Foto toevoegen", style = MaterialTheme.typography.headlineLarge)
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                "Voeg een foto toe om je persoonlijke stijlprofiel te maken",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Spacer(modifier = Modifier.height(32.dp))

                            if (photoUri != null) {
                                // Show selected photo
                                Card(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(300.dp),
                                    shape = RoundedCornerShape(16.dp)
                                ) {
                                    AsyncImage(
                                        model = ImageRequest.Builder(LocalContext.current)
                                            .data(photoUri)
                                            .size(Size.ORIGINAL)
                                            .scale(Scale.FIT)
                                            .build(),
                                        contentDescription = "Geselecteerde foto",
                                        modifier = Modifier.fillMaxSize()
                                    )
                                }
                                Spacer(modifier = Modifier.height(16.dp))
                                TextButton(
                                    onClick = { photoUri = null },
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text("Andere foto kiezen")
                                }
                            } else {
                                // Show photo selection option
                                Card(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(200.dp),
                                    onClick = {
                                        photoPickerLauncher.launch(
                                            PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                                        )
                                    },
                                    shape = RoundedCornerShape(16.dp)
                                ) {
                                    Box(
                                        modifier = Modifier.fillMaxSize(),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                            Icon(
                                                Icons.Default.PhotoLibrary,
                                                contentDescription = null,
                                                modifier = Modifier.size(64.dp),
                                                tint = MaterialTheme.colorScheme.primary
                                            )
                                            Spacer(modifier = Modifier.height(16.dp))
                                            Text(
                                                "Foto uploaden",
                                                style = MaterialTheme.typography.titleLarge,
                                                fontWeight = FontWeight.Medium
                                            )
                                            Spacer(modifier = Modifier.height(8.dp))
                                            Text(
                                                "Kies een foto uit je galerij",
                                                style = MaterialTheme.typography.bodyMedium,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        }
                                    }
                                }
                                
                                Spacer(modifier = Modifier.height(16.dp))
                                TextButton(
                                    onClick = {
                                        // Skip photo for now
                                        photoUri = null
                                    },
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text("Foto later toevoegen")
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            Button(
                onClick = {
                    if (step < 3) {
                        step++
                    } else {
                        onComplete(firstName, lastName, birthDate, photoUri)
                    }
                },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                enabled = when(step) {
                    0 -> firstName.isNotBlank()
                    1 -> lastName.isNotBlank()
                    2 -> birthDate.isNotBlank()
                    3 -> true // Photo is optional
                    else -> false
                }
            ) {
                Text(if (step < 3) "Volgende" else "Afronden")
                Spacer(modifier = Modifier.width(8.dp))
                Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null)
            }
        }
    }
}
