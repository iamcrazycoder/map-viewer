import React from "react";
import { LocationInsight } from "../types";
import { Marker } from "react-map-gl";
import styled from "styled-components";
import { MarkerBtn, MarkerText } from "./MarkerElements";

type InsightMarkerOption = {
    insights?: LocationInsight[]
    handleSelectedLocation: (location: LocationInsight) => void
}

const LocationBtn = styled(MarkerBtn)`
  background: #2bab46;
  width: 50px;
  height: 50px;
  border: 2px solid #1e8f35;
  border-radius: 40px;
`

const InsightMarker: React.FC<InsightMarkerOption> = ({ insights = [], handleSelectedLocation}) => {
    const data = insights.map((location) => (
        <Marker 
          key={location.city}
          longitude={location.longitude}
          latitude={location.latitude}>
          <LocationBtn onClick={(e) => {
            e.preventDefault()
            handleSelectedLocation(location)
          }}>
            <MarkerText>{location.count}</MarkerText>
          </LocationBtn>
        </Marker>
      ))

    return (
       <>{data}</>
    )
}

export { InsightMarker }