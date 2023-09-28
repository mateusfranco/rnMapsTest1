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

  useEffect(() => {
    axios
      .get(
        'https://api.mapbox.com/optimized-trips/v1/mapbox/driving-traffic/-37.9821,-4.92824;-37.9679,-4.93217?geometries=geojson&language=en&overview=full&steps=true&access_token=pk.eyJ1IjoibWF0ZXVzZnMzMzMiLCJhIjoiY2xtemF5aTV4MWlhMzJ2cXdxZTViYm4wZyJ9.oFPvn7wSz_AceZlh04KUPA',
      )
      .then(resp => {
        setData({
          coordinates: resp.data.trips[0].geometry.coordinates.slice(
            0,
            resp.data.trips[0].geometry.coordinates.length / 2,
          ),
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
              compassViewPosition={1}>
              <Mapbox.Camera
                // ref={camera}
                zoomLevel={2}
                followUserLocation
                followZoomLevel={18}
                animationMode="flyTo"
                animationDuration={2000}
                followUserMode={Mapbox.UserTrackingMode.FollowWithHeading}
              />
              <Mapbox.ShapeSource
                id="source1"
                buffer={512}
                lineMetrics={true}
                shape={data}>
                <Mapbox.LineLayer id="layer1" style={styles.lineLayer} />
              </Mapbox.ShapeSource>
              <Mapbox.UserLocation
                onUpdate={(userDataUpdated: Mapbox.Location) => {
                  const userLat = userDataUpdated.coords.latitude;
                  const userLng = userDataUpdated.coords.longitude;

                  const indexCoord = data.coordinates.findIndex(
                    (coords: any, idx) => {
                      if (idx === 0) {
                        return false;
                      }
                      const lngDiff = coords[0] - userLng;
                      const latDiff = coords[1] - userLat;
                      const res =
                        lngDiff < 0.0001 &&
                        lngDiff > -0.0001 &&
                        latDiff < 0.0001 &&
                        latDiff > -0.0001;
                      return res;
                    },
                  );

                  setData(old => {
                    if (indexCoord < 0) {
                      const oldCoords = old.coordinates;
                      oldCoords[0] = [userLng, userLat];
                      return {
                        ...old,
                        coordinates: oldCoords,
                      };
                    }
                    return {
                      ...old,
                      coordinates: [
                        [userLng, userLat],
                        ...old.coordinates.slice(
                          (indexCoord < 0 ? 0 : indexCoord) + 1,
                        ),
                      ],
                    };
                  });
                }}
                minDisplacement={1}
                androidRenderMode="gps"
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
  },
});
