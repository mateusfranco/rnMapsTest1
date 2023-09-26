import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import axios from 'axios';

Mapbox.setAccessToken(
  'pk.eyJ1IjoibWF0ZXVzZnMzMzMiLCJhIjoiY2xtemF5aTV4MWlhMzJ2cXdxZTViYm4wZyJ9.oFPvn7wSz_AceZlh04KUPA',
);

const App = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    axios
      .get(
        'https://api.mapbox.com/optimized-trips/v1/mapbox/driving-traffic/-37.9821,-4.92824;-37.9679,-4.93217?geometries=geojson&language=en&overview=full&steps=true&access_token=pk.eyJ1IjoibWF0ZXVzZnMzMzMiLCJhIjoiY2xtemF5aTV4MWlhMzJ2cXdxZTViYm4wZyJ9.oFPvn7wSz_AceZlh04KUPA',
      )
      .then(resp => {
        setData(resp.data.trips[0].geometry.coordinates);
      });
  }, []);

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <Mapbox.MapView
          style={styles.map}
          compassEnabled
          compassViewPosition={2}>
          <Mapbox.Camera
            zoomLevel={2}
            followUserLocation
            followZoomLevel={15}
            heading={21}
          />
          <Mapbox.ShapeSource
            id="source1"
            lineMetrics={true}
            shape={
              {
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: data,
                },
              } as any
            }>
            <Mapbox.LineLayer id="layer1" style={styles.lineLayer} />
          </Mapbox.ShapeSource>
          <Mapbox.UserLocation visible />
        </Mapbox.MapView>
      </View>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    height: '100%',
    width: '100%',
  },
  map: {
    flex: 1,
  },
  lineLayer: {
    lineColor: 'red',
    lineCap: 'round',
    lineJoin: 'round',
    lineWidth: 3,
    lineGradient: [
      'interpolate',
      ['linear'],
      ['line-progress'],
      0,
      'blue',
      0.1,
      'royalblue',
      0.3,
      'cyan',
      0.5,
      'lime',
      0.7,
      'yellow',
      1,
      'red',
    ],
  },
});
