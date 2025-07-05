package com.esportsnexus.dto.pubg;

import lombok.Data;
import java.util.Map;

@Data
public class PubgSeasonStatsDto {
    private String seasonId;
    private Map<String, Map<String, Object>> gameModeStats;
}