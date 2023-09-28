import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Mapbox, {offlineManager} from '@rnmapbox/maps';
import axios from 'axios';
import {Position} from '@rnmapbox/maps/lib/typescript/types/Position';
import OfflinePack from '@rnmapbox/maps/lib/typescript/modules/offline/OfflinePack';

Mapbox.setAccessToken(
  'pk.eyJ1IjoibWF0ZXVzZnMzMzMiLCJhIjoiY2xtemF5aTV4MWlhMzJ2cXdxZTViYm4wZyJ9.oFPvn7wSz_AceZlh04KUPA',
);
const mapStyle = 'mapbox://styles/mapbox/streets-v12';

const App = () => {
  const [data, setData] = useState<any>();
  const [savedMap, setSavedMap] = useState<OfflinePack>();

  const isNearCordinate = (diff1: number, diff2: number) =>
    diff1 < 0.00015 && diff2 < 0.00015;

  const cordDiff = (pos1: Position, pos2: Position) => {
    let lonDiff = pos1[0] - pos2[0];
    let latDiff = pos1[1] - pos2[1];

    lonDiff = lonDiff < 0 ? lonDiff * -1 : lonDiff;
    latDiff = latDiff < 0 ? latDiff * -1 : latDiff;

    if (isNearCordinate(lonDiff, latDiff)) {
      // menor que 11.1 metros;
      return true;
    }
    return false;
  };

  const isCordinateNearRoute = (currentPos: Position, route: Position[]) => {
    const a = route.findIndex(routePos => cordDiff(currentPos, routePos));
    return a;
  };

  const cleanBeforeRoutePos = (routeIndex: number, currentPos: Position) => {
    setData((data1: any) => {
      const newRoute = data1?.coordinates?.slice(routeIndex);

      return {type: data1.type, coordinates: [currentPos, ...newRoute]};
    });
  };

  const createMultiplePacks = async () => {
    // line rec
    const currentLat = -9.904285;
    const squareLat = -10.654989;
    console.log('creating packs');
    for (
      let currentLon = -50.323859;
      currentLon > -61.390242;
      currentLon -= 1
    ) {
      console.log('S');
      setTimeout(async () => {
        const a = await offlineManager.createPack(
          {
            name: `MT-${currentLon}-${currentLat}`,
            styleURL: mapStyle,
            minZoom: 8,
            maxZoom: 20,
            bounds: [
              [currentLon, currentLat],
              [currentLon - 1, squareLat],
            ],
          },
          (_resData: any) => {
            console.log('deu certo');
            // setSavedMap(() => _resData);
          },
          (ifflineRegion: any, err: any) => {
            if (err) {
              console.log('error', err);
            } else {
              console.log(' nao sei ', ifflineRegion);
            }
          },
        );
        console.log('terminou pack');
      }, 500);
    }
  };

  useEffect(() => {
    (async () => {
      // const k = await offlineManager.getPack('offlinePack');
      // setSavedMap(() => k);
      // if (k) {
      //   return;
      // }
      await createMultiplePacks();
    })();
  }, []);

  useEffect(() => {
    if (savedMap) {
      axios
        .get(
          'https://api.mapbox.com/optimized-trips/v1/mapbox/driving-traffic/-37.9821,-4.92824;-37.9679,-4.93217?geometries=geojson&source=first&destination=last&roundtrip=false&language=en&overview=full&steps=true&access_token=pk.eyJ1IjoibWF0ZXVzZnMzMzMiLCJhIjoiY2xtemF5aTV4MWlhMzJ2cXdxZTViYm4wZyJ9.oFPvn7wSz_AceZlh04KUPA',
        )
        .then(resp => {
          setData({
            coordinates: resp.data.trips[0].geometry.coordinates,
            type: 'LineString',
          });
        });
    }
  }, [savedMap]);

  return (
    <>
      <View style={styles.page}>
        <View style={styles.container}>
          <Mapbox.MapView
            style={styles.map}
            compassEnabled
            compassViewPosition={1}
            styleURL={mapStyle}>
            <Mapbox.Camera
              // ref={camera}
              zoomLevel={2}
              followUserLocation
              followZoomLevel={18}
              heading={90}
              followPitch={60}
              followHeading={90}
              animationMode="flyTo"
              animationDuration={2000}
              followUserMode={Mapbox.UserTrackingMode.FollowWithHeading}
            />
            {data && (
              <Mapbox.ShapeSource
                id="source1"
                buffer={256}
                lineMetrics={true}
                shape={data}>
                <Mapbox.LineLayer id="layer1" style={styles.lineLayer} />
              </Mapbox.ShapeSource>
            )}
            <Mapbox.UserLocation
              onUpdate={(userDataUpdated: Mapbox.Location) => {
                const userPosition = [
                  userDataUpdated.coords.longitude,
                  userDataUpdated.coords.latitude,
                ];
                if (!data) {
                  return;
                }
                const isNearIndex = isCordinateNearRoute(
                  userPosition,
                  data.coordinates,
                );
                if (isNearIndex > 0) {
                  cleanBeforeRoutePos(isNearIndex, userPosition);
                }
              }}
              minDisplacement={1}
              androidRenderMode="compass"
              visible
            />
          </Mapbox.MapView>
        </View>
      </View>
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
