package com.esportsnexus.dto.pubg;

import lombok.Data;

@Data
public class PubgParticipantDto {
    private String id;
    private String name;
    private String playerId;
    private int kills;
    private int assists;
    private double damageDealt;
    private int winPlace;
    private double timeSurvived;
    private int headshotKills;
    private double longestKill;
    private int revives;
    private int teamKills;
    private double walkDistance;
    private double swimDistance;
    private double rideDistance;
}