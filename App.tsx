import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import axios from 'axios';
import {Position} from '@rnmapbox/maps/lib/typescript/types/Position';

Mapbox.setAccessToken(
  'pk.eyJ1IjoibWF0ZXVzZnMzMzMiLCJhIjoiY2xtemF5aTV4MWlhMzJ2cXdxZTViYm4wZyJ9.oFPvn7wSz_AceZlh04KUPA',
);

const App = () => {
  const [data, setData] = useState<any>();

  const isNearCordinate = (diff1: number, diff2: number) =>
    diff1 < 0.0001 && diff2 < 0.0001;

  const cordDiff = (pos1: Position, pos2: Position) => {
    let lonDiff = pos1[0] - pos2[0];
    let latDiff = pos1[1] - pos2[1];

    lonDiff = lonDiff < 0 ? lonDiff * -1 : lonDiff;
    latDiff = latDiff < 0 ? latDiff * -1 : latDiff;

    if (isNearCordinate(lonDiff, latDiff)) {
      // menor que 11.1 metros;
      console.log(pos1, pos2);
      return true;
    }
    return false;
  };

  const isCordinateNearRoute = (currentPos: Position, route: Position[]) => {
    const a = route.findIndex(routePos => cordDiff(currentPos, routePos));
    return a;
  };

  const cleanBeforeRoutePos = (routeIndex: number) => {
    setData((data1: any) => {
      const newRoute = data1?.coordinates.slice(routeIndex);

      console.log(newRoute);

      return {...data1, coordinates: newRoute.reverse()};
    });
  };

  useEffect(() => {
    axios
      .get(
        'https://api.mapbox.com/optimized-trips/v1/mapbox/driving-traffic/-37.9821,-4.92824;-37.9679,-4.93217?geometries=geojson&language=en&overview=full&steps=true&access_token=pk.eyJ1IjoibWF0ZXVzZnMzMzMiLCJhIjoiY2xtemF5aTV4MWlhMzJ2cXdxZTViYm4wZyJ9.oFPvn7wSz_AceZlh04KUPA',
      )
      .then(resp => {
        setData({
          coordinates: resp.data.trips[0].geometry.coordinates,
          type: 'LineString',
        });
      });
  }, []);

  return (
    <>
      {data && (
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
                buffer={400}
                shape={data}>
                <Mapbox.LineLayer id="layer1" style={styles.lineLayer} />
              </Mapbox.ShapeSource>
              <Mapbox.UserLocation
                onUpdate={(userDataUpdated: Mapbox.Location) => {
                  const userPosition = [
                    userDataUpdated.coords.longitude,
                    userDataUpdated.coords.latitude,
                  ];
                  const isNearIndex = isCordinateNearRoute(
                    userPosition,
                    data.coordinates,
                  );
                  if (isNearIndex > 0) {
                    console.log('findIndex', isNearIndex);
                    console.log('OPA');
                    cleanBeforeRoutePos(isNearIndex);
                  }
                }}
                visible
              />
            </Mapbox.MapView>
          </View>
        </View>
      )}
    </>
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
