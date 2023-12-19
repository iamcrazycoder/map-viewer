import React, { useCallback, useState, useRef } from 'react';
import Map, { type MapRef, Popup } from 'react-map-gl';
import { useLazyQuery, useQuery } from '@apollo/client';

import "mapbox-gl/dist/mapbox-gl.css";

import { LocationInsight, Tree, TreePayload } from './types';
import { GET_TREES_INSIGHTS_QUERY, GET_TREES_QUERY, GET_TREE_QUERY } from './gql-queries';
import { useDebouncedCallback } from 'use-debounce';
import { InsightMarker } from './markers/InsightMarker';
import { TreeMarker } from './markers/TreeMarker';
import { FilterPayload, TreeFilter } from './TreeFilter';

function Home() {
  const mapRef = useRef<MapRef>()
  const [viewport, setViewport] = useState({
    longitude: -73.84421521958048,
    latitude: 40.723091773924274,
    zoom: 11,
  })
  const [selectedLocation, setSelectedLocation] = useState<LocationInsight | null>(null)
  const [selectedTree, setSelectedTree] = useState<TreePayload | null>()
  const [filter, setFilter] = useState<FilterPayload>({
    health: [],
    species: [],
    problems: []
  })

  const [getTree, { data: { getTree: tree } = { getTree: [] }}] = useLazyQuery<{ getTree: Tree[] }>(GET_TREE_QUERY)
  const [getTrees, { loading: dataLoading, data: { getTrees: trees } = { getTrees: [] }}] = useLazyQuery<{ getTrees: TreePayload[] }>(GET_TREES_QUERY)
  const { loading: insightsloading, data: { getTreesInsights: insights } = { getTreesInsights: [] }} = useQuery<{ getTreesInsights: LocationInsight[] }>(GET_TREES_INSIGHTS_QUERY, {
    variables: {
      boundingBox: [
        [-79.7633786294863, 40.502009391283906],
        [-71.85616396303963,45.01550900568005],
      ],
      filter
    }
  })

  const retrieveTrees = useDebouncedCallback((filter: FilterPayload) => {
    getTrees({
      variables: {
        boundingBox: mapRef.current?.getBounds().toArray(),
        filter
      }
    })
  }, 600)

  const onMoveHandler = useCallback((evt) => {
    setViewport(evt.viewState)
  
    if(evt.viewState.zoom < 12 && viewport.zoom > 12) {
      setSelectedLocation(null)
    }

    setSelectedTree(null)
    retrieveTrees(filter)
  }, [viewport, retrieveTrees, filter])

  const handleSelectedLocation = useCallback((location: LocationInsight) => {
    if(!mapRef || !mapRef.current) return

    setSelectedLocation(location)

    mapRef.current
    .fitBounds([...location.boundingBox[0], ...location.boundingBox[1]])
    .flyTo({
      zoom: 12,
      speed: 0.5,
      duration: 500,
      center: [location.longitude, location.latitude]
    })
  }, [mapRef])

  const handleSelectedTree = useCallback((tree: TreePayload) => {
    setSelectedTree(tree)
    getTree({
      variables: { id: tree.id }
    })
  }, [getTree])

  return (
    <Map
      {...viewport}
      ref={mapRef}
      onMove={onMoveHandler}
      style={{ width: "100vw", height: "100vh" }}
      mapboxAccessToken="pk.eyJ1IjoiaWFtY3Jhenljb2RlciIsImEiOiJjbHE2czdiNWwwenVxMm1udmk1bzd5dW94In0.19alGB_bZGJqFUL--GqXig"
      mapStyle="mapbox://styles/mapbox/streets-v9"
    >
      {!selectedLocation && !insightsloading && <InsightMarker insights={insights} handleSelectedLocation={handleSelectedLocation} />}
      {selectedLocation && !dataLoading && <TreeMarker trees={trees} handleSelectedTree={handleSelectedTree} />}
      {(selectedTree && tree) && (<Popup longitude={selectedTree.longitude} latitude={selectedTree.latitude}><h2>{JSON.stringify(tree)}</h2></Popup>)}

      <TreeFilter filter={filter} setFilter={setFilter}/>
    </Map>
  );
}

export default Home