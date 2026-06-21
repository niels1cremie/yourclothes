package com.yourclothes.app.ui.insights

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.PieChart
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.yourclothes.app.ui.wardrobe.WardrobeItemCard

@Composable
fun InsightsScreen(viewModel: InsightsViewModel) {
    val state by viewModel.state.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text(
            "Insights",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold
        )
        Text(
            "Ontdek je kledingstijl en gewoontes",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(32.dp))

        when (val s = state) {
            is InsightsState.Loading -> {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
            }
            is InsightsState.Success -> {
                StatCard("Totaal items", s.totalItems.toString(), Icons.Default.BarChart)
                Spacer(modifier = Modifier.height(16.dp))
                StatCard("Grootste categorie", s.topCategory, Icons.Default.PieChart)
                
                Spacer(modifier = Modifier.height(32.dp))
                
                Text("Kleurverdeling", style = MaterialTheme.typography.titleLarge)
                Spacer(modifier = Modifier.height(16.dp))
                
                s.colorDistribution.forEach { (color, count) ->
                    ColorRow(color, count, s.totalItems)
                    Spacer(modifier = Modifier.height(8.dp))
                }

                if (s.leastWornItem != null) {
                    Spacer(modifier = Modifier.height(32.dp))
                    Text("Vergeten item?", style = MaterialTheme.typography.titleLarge)
                    Text("Dit item heb je al lang niet gedragen", style = MaterialTheme.typography.bodySmall)
                    Spacer(modifier = Modifier.height(16.dp))
                    Box(modifier = Modifier.size(150.dp)) {
                        WardrobeItemCard(s.leastWornItem)
                    }
                }
            }
            is InsightsState.Error -> {
                Text(s.message)
            }
        }
    }
}

@Composable
fun StatCard(label: String, value: String, icon: androidx.compose.ui.graphics.vector.ImageVector) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.medium
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, null, tint = MaterialTheme.colorScheme.primary)
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(label, style = MaterialTheme.typography.labelMedium)
                Text(value, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun ColorRow(color: String, count: Int, total: Int) {
    val percentage = (count.toFloat() / total.toFloat())
    Column {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(color)
            Text("${(percentage * 100).toInt()}%")
        }
        LinearProgressIndicator(
            progress = { percentage },
            modifier = Modifier.fillMaxWidth().height(8.dp),
            strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        )
    }
}
