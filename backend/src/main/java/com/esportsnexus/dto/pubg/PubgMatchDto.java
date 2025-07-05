package com.esportsnexus.dto.pubg;

import lombok.Data;
import java.util.List;

@Data
public class PubgMatchDto {
    private String id;
    private String createdAt;
    private int duration;
    private String gameMode;
    private String mapName;
    private String matchType;
    private String shardId;
    private String titleId;
    private List<PubgParticipantDto> participants;
    private String telemetryUrl;
}