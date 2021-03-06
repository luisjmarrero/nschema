"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function messages() {
    const Point = {
        description: `Points are represented as latitude-longitude pairs in the E7 representation
    (degrees multiplied by 10**7 and rounded to the nearest integer).
    Latitudes should be in the range +/- 90 degrees and longitude should be in
    the range +/- 180 degrees (inclusive).`,
        name: "Point",
        properties: {
            latitude: {
                description: "Latitude",
                type: "int"
            },
            longitude: {
                description: "Longitude",
                type: "int"
            }
        },
        type: "object"
    };
    const Rectangle = {
        description: `A latitude-longitude rectangle, represented as two diagonally opposite
    points "lo" and "hi".`,
        name: "Rectangle",
        properties: {
            lo: {
                description: "One corner of the rectangle.",
                type: {
                    name: Point.name
                }
            },
            hi: {
                description: "The other corner of the rectangle.",
                type: {
                    name: Point.name
                }
            }
        },
        type: "object"
    };
    const Feature = {
        description: `A feature names something at a given point.

If a feature could not be named, the name is empty.`,
        name: "Feature",
        properties: {
            location: {
                description: "The point where the feature is detected.",
                type: {
                    name: Point.name
                }
            },
            name: {
                description: "The name of the feature.",
                type: "string"
            }
        },
        type: "object"
    };
    const RouteNote = {
        description: `A RouteNote is a message sent while at a given point.`,
        name: "RouteNote",
        properties: {
            location: {
                description: "The location from which the message is sent.",
                type: {
                    name: Point.name
                }
            },
            message: {
                description: "The message to be sent.",
                type: "string"
            }
        },
        type: "object"
    };
    const RouteSummary = {
        description: `A RouteSummary is received in response to a RecordRoute rpc.

It contains the number of individual points received, the number of
detected features, and the total distance covered as the cumulative sum of
the distance between each point.`,
        name: "RouteSummary",
        properties: {
            point_count: {
                description: "The number of points received.",
                type: "int"
            },
            feature_count: {
                description: "The number of known features passed while traversing the route.",
                type: "int"
            },
            distance: {
                description: "The distance covered in metres.",
                type: "int"
            },
            elapsed_time: {
                description: "The duration of the traversal in seconds.",
                type: "int"
            }
        },
        type: "object"
    };
    return [Point, RouteSummary, Rectangle, Feature, RouteNote];
}
const $target = [];
const bundle = {
    $target,
    list: messages(),
    namespace: "io.grpc.examples.routeguide.Model",
    type: "bundle"
};
exports.default = bundle;
