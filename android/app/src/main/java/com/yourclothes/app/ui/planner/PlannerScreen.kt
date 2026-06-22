package com.yourclothes.app.ui.planner

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.yourclothes.app.data.PlannedOutfit
import com.yourclothes.app.ui.wardrobe.WardrobeItemCard
import java.time.LocalDate
import java.time.format.TextStyle
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlannerScreen(viewModel: PlannerViewModel) {
    val state by viewModel.state.collectAsState()
    val selectedDate by viewModel.selectedDate.collectAsState()
    val outfitCreationState by viewModel.outfitCreationState.collectAsState()
    val weekOutfits by viewModel.weekOutfits.collectAsState()
    val occasionTemplates by viewModel.occasionTemplates.collectAsState()
    
    val showCreateDialog = remember { mutableStateOf(false) }
    val showEditDialog = remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mijn Planner") },
                actions = {
                    IconButton(onClick = { viewModel.navigateWeek(-1) }) {
                        Icon(Icons.Default.ArrowBack, "Vorige week")
                    }
                    IconButton(onClick = { viewModel.navigateWeek(1) }) {
                        Icon(Icons.Default.ArrowForward, "Volgende week")
                    }
                }
            )
        },
        floatingActionButton = {
            if (outfitCreationState == com.yourclothes.app.ui.planner.OutfitCreationState.Idle) {
                when (state) {
                    is PlannerState.Success -> {
                        val outfit = (state as PlannerState.Success).outfit
                        if (outfit == null) {
                            FloatingActionButton(
                                onClick = { showCreateDialog.value = true }
                            ) {
                                Icon(Icons.Default.Add, "Outfit toevoegen")
                            }
                        } else {
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                FloatingActionButton(
                                    onClick = { showEditDialog.value = true },
                                    containerColor = MaterialTheme.colorScheme.secondary
                                ) {
                                    Icon(Icons.Default.Create, "Outfit bewerken")
                                }
                                FloatingActionButton(
                                    onClick = { outfit.id?.let { viewModel.deleteOutfit(it) } },
                                    containerColor = MaterialTheme.colorScheme.error
                                ) {
                                    Icon(Icons.Default.Delete, "Outfit verwijderen")
                                }
                            }
                        }
                    }
                    else -> {}
                }
            }
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize().padding(16.dp)) {
            // Month/Year Header
            val monthName = selectedDate.month.getDisplayName(TextStyle.FULL, Locale("nl"))
            Text(
                "$monthName ${selectedDate.year}",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(24.dp))

            // Horizontal Date Picker
            val weekDays = remember(selectedDate) {
                (0..6).map { selectedDate.minusDays(selectedDate.dayOfWeek.value.toLong() - 1).plusDays(it.toLong()) }
            }

            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(weekDays) { date ->
                    DateItem(
                        date = date,
                        isSelected = date == selectedDate,
                        hasOutfit = weekOutfits.any { it.date == date.format(java.time.format.DateTimeFormatter.ISO_DATE) },
                        onClick = { viewModel.selectDate(date) }
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Weather Mock
            WeatherCard()

            Spacer(modifier = Modifier.height(32.dp))

            when (val s = state) {
                is PlannerState.Loading -> {
                    Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                }
                is PlannerState.Error -> {
                    Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                s.message,
                                color = MaterialTheme.colorScheme.error
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Button(onClick = { viewModel.selectDate(selectedDate) }) {
                                Text("Probeer opnieuw")
                            }
                        }
                    }
                }
                is PlannerState.Success -> {
                    if (s.outfit == null || s.outfit.items.isEmpty()) {
                        Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Icon(
                                    Icons.Default.CalendarToday, 
                                    null, 
                                    modifier = Modifier.size(64.dp).alpha(0.2f)
                                )
                                Spacer(modifier = Modifier.height(16.dp))
                                Text(
                                    "Nog geen outfit gepland",
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    style = MaterialTheme.typography.titleLarge
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    "Tik op + om een outfit toe te voegen",
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    style = MaterialTheme.typography.bodyMedium
                                )
                            }
                        }
                    } else {
                        OutfitDetailCard(s.outfit, onEdit = { showEditDialog.value = true })
                    }
                }
            }
        }
    }

    // Create Outfit Dialog
    if (showCreateDialog.value) {
        OutfitCreationDialog(
            occasionTemplates = occasionTemplates,
            onCreateOutfit = { occasion, notes ->
                viewModel.startCreatingOutfit()
                showCreateDialog.value = false
            },
            onDismiss = { showCreateDialog.value = false }
        )
    }

    // Edit Outfit Dialog
    if (showEditDialog.value) {
        val currentOutfit = (state as? PlannerState.Success)?.outfit
        currentOutfit?.let { outfit ->
            OutfitEditDialog(
                currentOutfit = outfit,
                occasionTemplates = occasionTemplates,
                onUpdateOutfit = { updatedOccasion, updatedNotes ->
                    val updatedOutfit = outfit.copy(
                        occasion = updatedOccasion,
                        notes = updatedNotes
                    )
                    viewModel.updateOutfit(updatedOutfit)
                    showEditDialog.value = false
                },
                onDismiss = { showEditDialog.value = false }
            )
        }
    }
}

@Composable
fun WeatherCard() {
    Card(
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
        ),
        shape = MaterialTheme.shapes.large,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.Cloud, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(32.dp))
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text("18°C · Bewolkt", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                Text("Amsterdam, NL", style = MaterialTheme.typography.bodySmall)
                Text("Lichte regen verwacht", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

@Composable
fun OutfitDetailCard(outfit: PlannedOutfit, onEdit: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    outfit.occasion?.let {
                        Text(
                            it,
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Text(
                        outfit.date,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                IconButton(onClick = onEdit) {
                    Icon(Icons.Default.Create, "Bewerken")
                }
            }

            if (!outfit.notes.isNullOrEmpty()) {
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    outfit.notes,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.heightIn(max = 400.dp)
            ) {
                items(outfit.items) { item ->
                    WardrobeItemCard(item)
                }
            }

            outfit.weatherCondition?.let {
                Spacer(modifier = Modifier.height(12.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Cloud,
                        null,
                        modifier = Modifier.size(16.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "Weer: $it",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
fun OutfitCreationDialog(
    occasionTemplates: List<com.yourclothes.app.data.OccasionTemplate>,
    onCreateOutfit: (String, String?) -> Unit,
    onDismiss: () -> Unit
) {
    var selectedOccasion by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Nieuwe Outfit") },
        text = {
            Column(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
                Text(
                    "Gelegenheid:",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Medium
                )
                Spacer(modifier = Modifier.height(8.dp))
                
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.heightIn(max = 200.dp)
                ) {
                    items(occasionTemplates) { template ->
                        OccasionChip(
                            template = template,
                            selected = selectedOccasion == template.name,
                            onClick = { selectedOccasion = template.name }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Notities (optioneel)") },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 3
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onCreateOutfit(selectedOccasion, notes.takeIf { it.isNotBlank() }) },
                enabled = selectedOccasion.isNotBlank()
            ) {
                Text("Aanmaken")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Annuleren")
            }
        }
    )
}

@Composable
fun OutfitEditDialog(
    currentOutfit: PlannedOutfit,
    occasionTemplates: List<com.yourclothes.app.data.OccasionTemplate>,
    onUpdateOutfit: (String, String?) -> Unit,
    onDismiss: () -> Unit
) {
    var selectedOccasion by remember { mutableStateOf(currentOutfit.occasion ?: "") }
    var notes by remember { mutableStateOf(currentOutfit.notes ?: "") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Outfit Bewerken") },
        text = {
            Column(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
                Text(
                    "Gelegenheid:",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Medium
                )
                Spacer(modifier = Modifier.height(8.dp))
                
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.heightIn(max = 200.dp)
                ) {
                    items(occasionTemplates) { template ->
                        OccasionChip(
                            template = template,
                            selected = selectedOccasion == template.name,
                            onClick = { selectedOccasion = template.name }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Notities") },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 3
                )
            }
        },
        confirmButton = {
            Button(onClick = { onUpdateOutfit(selectedOccasion, notes.takeIf { it.isNotBlank() }) }) {
                Text("Opslaan")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Annuleren")
            }
        }
    )
}

@Composable
fun OccasionChip(
    template: com.yourclothes.app.data.OccasionTemplate,
    selected: Boolean,
    onClick: () -> Unit
) {
    FilterChip(
        selected = selected,
        onClick = onClick,
        label = { Text(template.name) },
        leadingIcon = if (selected) {
            {
                Icon(
                    Icons.Default.Check,
                    contentDescription = "Geselecteerd",
                    modifier = Modifier.size(16.dp)
                )
            }
        } else null
    )
}

@Composable
fun DateItem(date: LocalDate, isSelected: Boolean, hasOutfit: Boolean, onClick: () -> Unit) {
    val dayName = date.dayOfWeek.getDisplayName(TextStyle.SHORT, Locale("nl"))
    val dayNumber = date.dayOfMonth.toString()

    Column(
        modifier = Modifier
            .width(60.dp)
            .clip(MaterialTheme.shapes.medium)
            .background(if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
            .clickable { onClick() }
            .padding(vertical = 12.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            dayName.uppercase(),
            fontSize = 10.sp,
            color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            dayNumber,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
        )
        if (hasOutfit && !isSelected) {
            Spacer(modifier = Modifier.height(4.dp))
            Box(
                modifier = Modifier
                    .size(6.dp)
                    .background(MaterialTheme.colorScheme.primary, CircleShape)
            )
        }
    }
}
