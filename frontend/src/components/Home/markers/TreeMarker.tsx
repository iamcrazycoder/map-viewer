import React from 'react'
import { TreePayload } from '../types'
import { Marker } from 'react-map-gl'
import { MarkerBtn, MarkerIcon } from './MarkerElements'

type InsightMarkerOption = {
    trees: TreePayload[]
    handleSelectedTree: (tree: TreePayload) => void
}

const TreeMarker: React.FC<InsightMarkerOption> = ({ trees = [], handleSelectedTree}) => {
    const data = trees.map((tree: TreePayload) => (
          <Marker
            key={tree.id}
            longitude={tree.longitude}
            latitude={tree.latitude}
            >
            <MarkerBtn
              onClick={(e) => {
                e.preventDefault()
                handleSelectedTree(tree)
              }}>
              <MarkerIcon alt="img" src={
                tree.health === 'Fair' ? "https://cdn-icons-png.flaticon.com/128/785/785202.png"
                  : tree.health === "Poor" ? "https://icon-library.com/images/hal-tree-512.png"
                  : "https://cdn-icons-png.flaticon.com/512/490/490091.png"
                } />
            </MarkerBtn>
          </Marker>
    ))

    return (
        <>{data}</>
    )
}

export { TreeMarker }