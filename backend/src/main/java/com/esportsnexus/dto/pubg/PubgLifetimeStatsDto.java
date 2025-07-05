package com.esportsnexus.dto.pubg;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.Map;

@Data
@EqualsAndHashCode(callSuper = true)
public class PubgLifetimeStatsDto extends PubgSeasonStatsDto {
    // Inherits gameModeStats from PubgSeasonStatsDto
    // Lifetime stats have the same structure as season stats
}