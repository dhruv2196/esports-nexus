package com.esportsnexus.dto.pubg;

import lombok.Data;
import java.util.List;

@Data
public class PubgPlayerDto {
    private String id;
    private String name;
    private String shardId;
    private List<String> matchIds;
    private String createdAt;
    private String updatedAt;
}