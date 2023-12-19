import { useQuery } from '@apollo/client';
import React from 'react';
import Select, { ActionMeta, MultiValue } from 'react-select'
import { GET_FILTER_OPTIONS_QUERY } from './gql-queries';
import styled from 'styled-components';
import { capitalizeSentence } from 'utils';

export type FilterPayload = {
    health: string[]
    species: string[]
    problems: string[]
}

type FilterOptionsPayload = {
    getFilterOptions: FilterPayload
}

type SelectOption = {
    label: string
    value: string | null
}

type SelectFilterOptions = {
    filter: FilterPayload
    setFilter: (data: FilterPayload) => void
}

const FilterContainer = styled.div`
    position: absolute;
    width: 300px;
    top: 10px;
    right: 10px;
    padding: 0;
`

const FilterTitle = styled.h2`
    background: #DDD;
    width: 100%;
    text-align: center;
    font-weight: bold;
    margin: 0;
    padding: 10px 0px;
    color: #555;
`

const SelectElement = styled(Select)`
    color: #555;
    font-weight: bold;

`

const TreeFilter: React.FC<SelectFilterOptions> = ({ filter, setFilter }) => {
    const { loading, data } = useQuery<FilterOptionsPayload | null>(GET_FILTER_OPTIONS_QUERY)

    const health: SelectOption[] = data?.getFilterOptions.health.map(v => ({
        label: v ? capitalizeSentence(v): "Unspecified",
        value: v || ""
    })) || []

    const problems: SelectOption[] = data?.getFilterOptions.problems.map(v => ({
        label: v ? capitalizeSentence(v): "Unspecified",
        value: v || ""
    })) || []

    const species: SelectOption[] = data?.getFilterOptions.species.map(v => ({
        label: v ? capitalizeSentence(v): "Unspecified",
        value: v || ""
    })) || []

    const handleSelect = (newValues: MultiValue<SelectOption>, meta: ActionMeta<SelectOption>) => {
        setFilter({
            ...filter,
            [meta.name!]: newValues.map(obj => obj.value)
        })
    }

    return (
        <FilterContainer id="filter-container">
            <FilterTitle>Map-viewer Filter</FilterTitle>
            <>
            <SelectElement
                options={health}
                name='health'
                onChange={handleSelect}
                isLoading={loading}
                placeholder="Select health"
                isMulti
            />
            <SelectElement
                options={problems}
                name='problems'
                onChange={handleSelect}
                isLoading={loading}
                placeholder="Select problems"
                isMulti
            />
            <SelectElement
                options={species}
                name='species'
                onChange={handleSelect}
                isLoading={loading}
                placeholder="Select species"
                isMulti
            />
            </>
        </FilterContainer>
    )
}

export { TreeFilter }