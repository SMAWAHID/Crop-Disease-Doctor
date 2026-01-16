import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import ReactTooltip from 'react-tooltip';


const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const WorldMap = () => {
    const [tooltipContent, setTooltipContent] = useState('');

    return (
        <div className="world-map-container glass-panel p-4">
            <ComposableMap projection="geoMercator" data-tip="" height={400}>
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map((geo) => (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                onMouseEnter={() => {
                                    const { NAME } = geo.properties;
                                    setTooltipContent(NAME);
                                }}
                                onMouseLeave={() => {
                                    setTooltipContent('');
                                }}
                                style={{
                                    default: {
                                        fill: 'var(--bg-surface)',
                                        outline: 'none',
                                    },
                                    hover: {
                                        fill: 'var(--primary)',
                                        outline: 'none',
                                    },
                                    pressed: {
                                        fill: 'var(--secondary)',
                                        outline: 'none',
                                    },
                                }}
                            />
                        ))
                    }
                </Geographies>
            </ComposableMap>
            <ReactTooltip>{tooltipContent}</ReactTooltip>
        </div>
    );
};

export default WorldMap;
