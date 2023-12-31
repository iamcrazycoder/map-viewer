import React, { useCallback, useState, useEffect } from 'react';
import Map, { Popup } from 'react-map-gl';
import { useLazyQuery } from '@apollo/client';

import "mapbox-gl/dist/mapbox-gl.css";

import { BoundingBox, LocationInsight, Tree, TreePayload } from './types';
import { GET_TREES_INSIGHTS_QUERY, GET_TREES_QUERY, GET_TREE_QUERY } from './gql-queries';
import { useDebouncedCallback } from 'use-debounce';
import { InsightMarker } from './markers/InsightMarker';
import { TreeMarker } from './markers/TreeMarker';
import { FilterPayload, TreeFilter } from './TreeFilter';
import styled from 'styled-components';

const ControlBox = styled.div`
  position: absolute;
  width: 300px;
  top: 7%;
  right: 10px;
  padding: 0;
`

const LoadingBox = styled.div`
  position: absolute;
  width: 100%;
  background: #ffffff;
  color: #0b550a;
  font-weight: bold;
  font-size: 14px;
  padding: 10px 0px;
  text-align: center;
  box-shadow: 0px 0px 10px 5px rgb(0 0 0 / 17%);
`

const MINIMUM_TREES_VIEWING_ZOOM = 12
const DEFAULT_ZOOM = 10
const DEFAULT_COORDINATES = [-73.84421521958048, 40.723091773924274]
const DEBOUNCE_DELAY = 600 // milliseconds

function Home() {
  // TODO: any type to mapRef
  const [mapRef, setMapRef] = useState<any>()
  const [viewport, setViewport] = useState({
    longitude: DEFAULT_COORDINATES[0],
    latitude: DEFAULT_COORDINATES[1],
    zoom: DEFAULT_ZOOM,
  })
  const [selectedLocation, setSelectedLocation] = useState<LocationInsight | null>(null)
  const [selectedTree, setSelectedTree] = useState<TreePayload | null>()
  const [filter, setFilter] = useState<FilterPayload>({
    health: [],
    species: [],
    problems: []
  })

  const [getTree, { loading: treeLoading, data: { getTree: tree } = { getTree: [] }}] = useLazyQuery<{ getTree: Tree[] }>(GET_TREE_QUERY)
  const [getTrees, { loading: dataLoading, data: { getTrees: trees } = { getTrees: [] }}] = useLazyQuery<{ getTrees: TreePayload[] }>(GET_TREES_QUERY)
  const [getTreeInsights, { loading: insightsloading, data: { getTreesInsights: insights } = { getTreesInsights: [] }}] = useLazyQuery<{ getTreesInsights: LocationInsight[] }>(GET_TREES_INSIGHTS_QUERY)

  const loading = treeLoading || dataLoading || insightsloading

  const retrieveTrees = useDebouncedCallback((filter: FilterPayload, boundingBox: BoundingBox) => {
    getTrees({
      variables: {
        boundingBox,
        filter
      }
    })
  }, DEBOUNCE_DELAY)

  const onMoveHandler = useCallback((evt) => {
    if(!mapRef) return

    setViewport(evt.viewState)
  
    if(evt.viewState.zoom < MINIMUM_TREES_VIEWING_ZOOM && viewport.zoom > MINIMUM_TREES_VIEWING_ZOOM) {
      setSelectedLocation(null)
    }

    setSelectedTree(null)

    if(viewport.zoom < MINIMUM_TREES_VIEWING_ZOOM) return 

    retrieveTrees(filter, mapRef.getBounds().toArray())
  }, [viewport, retrieveTrees, filter, mapRef])

  useEffect(() => {
    if(viewport.zoom < MINIMUM_TREES_VIEWING_ZOOM) {
      return
    }

    retrieveTrees(filter, mapRef.getBounds().toArray())
  }, [mapRef, filter, retrieveTrees, viewport])

  const handleSelectedLocation = useCallback((location: LocationInsight) => {
    if(!mapRef) return

    setSelectedLocation(location)

    mapRef
    .fitBounds([...location.boundingBox[0], ...location.boundingBox[1]])
    .flyTo({
      zoom: MINIMUM_TREES_VIEWING_ZOOM + 0.05,
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

  useEffect(() => {
    if(!mapRef) return 

    getTreeInsights( {
      variables: {
        boundingBox: mapRef?.getBounds().toArray(),
        filter
      }
    })

    // TODO: clean up?
  }, [mapRef, filter, getTreeInsights])

  return (
    <Map
      {...viewport}
      ref={(ref) => setMapRef(ref)}
      onMove={onMoveHandler}
      style={{ width: "100vw", height: "100vh" }}
      mapboxAccessToken="<access-token>"
      mapStyle="mapbox://styles/mapbox/streets-v9"
    >
      {!selectedLocation && !insightsloading && <InsightMarker insights={insights} handleSelectedLocation={handleSelectedLocation} />}
      {!dataLoading && viewport.zoom > MINIMUM_TREES_VIEWING_ZOOM && <TreeMarker trees={trees} handleSelectedTree={handleSelectedTree} />}
      {(selectedTree && tree) && (<Popup longitude={selectedTree.longitude} latitude={selectedTree.latitude}><h2>{JSON.stringify(tree)}</h2></Popup>)}

      
      <ControlBox>
        <TreeFilter filter={filter} setFilter={setFilter}/>
      </ControlBox>

      {loading && <LoadingBox>Loading..</LoadingBox>}
    </Map>
  );
}

export default Home