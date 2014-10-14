var controllers = angular.module('vumigo.controllers', []);

controllers.controller('CampaignMakerController', ['$scope',
    function ($scope) {

        $scope.data = {
            routing_table: {
                version: 'fsm-0.1',
                campaign_id: 'campaign1',
                components: {
                    'channel1': {
                        type: 'channel',
                        uuid: 'channel1',
                        tag: ['apposit_sms', '*121#'],
                        name: '*121#',
                        description: 'Apposit Sms: *121#',
                        utilization: 0.5,
                        endpoints: {
                            'endpoint3': {
                                type: 'channel_endpoint',
                                uuid: 'endpoint3',
                                name: 'default'
                            }
                        }
                    },
                    'channel2': {
                        type: 'channel',
                        uuid: 'channel2',
                        tag: ['sigh_sms', '*131#'],
                        name: '*131#',
                        description: 'Sigh Sms: *131#',
                        utilization: 0.5,
                        endpoints: {
                            'endpoint4': {
                                type: 'channel_endpoint',
                                uuid: 'endpoint4',
                                name: 'default'
                            }
                        }
                    },
                    'router1': {
                        type: 'router',
                        router_type: 'keyword',
                        uuid: 'router1',
                        name: 'K',
                        description: 'Keyword',
                        endpoints: {
                            'endpoint5': {
                                type: 'channel_endpoint',
                                uuid: 'endpoint5',
                                name: 'default'
                            },
                            'endpoint6': {
                                type: 'conversation_endpoint',
                                uuid: 'endpoint6',
                                name: 'default'
                            }
                        }
                    },
                    'conversation1': {
                        type: 'conversation',
                        conversation_type: 'bulk-message',
                        uuid: 'conversation1',
                        name: 'bulk-message1',
                        description: 'Some Bulk Message App',
                        endpoints: {
                            'endpoint1': {
                                type: 'conversation_endpoint',
                                uuid: 'endpoint1',
                                name: 'default'
                            }
                        }
                    },
                    'conversation2': {
                        type: 'conversation',
                        conversation_type: 'bulk-message',
                        uuid: 'conversation2',
                        name: 'bulk-message2',
                        description: 'Some Other Bulk Message App',
                        endpoints: {
                            'endpoint2': {
                                type: 'conversation_endpoint',
                                uuid: 'endpoint2',
                                name: 'default'
                            }
                        }
                    }
                },
                routing: {
                    'endpoint1:endpoint6': {
                        source: 'endpoint1',
                        target: 'endpoint6'
                    },
                    'endpoint6:endpoint1': {
                        source: 'endpoint6',
                        target: 'endpoint1'
                    }
                },
            },
            layout: {
                version: 'fsm-ui-0.1',
                components: {
                    'channel1': {
                        x: 840,
                        y: 360
                    },
                    'channel2': {
                        x: 840,
                        y: 140
                    },
                    'router1': {
                        x: 500,
                        y: 220
                    },
                    'conversation1': {
                        x: 220,
                        y: 120,
                        colour: '#f82943'
                    },
                    'conversation2': {
                        x: 220,
                        y: 340,
                        colour: '#fbcf3b'
                    }
                },
                routing: {
                    'endpoint1:endpoint6': 'connection1',
                    'endpoint6:endpoint1': 'connection1'
                },
                connections: {
                    'connection1': {
                        endpoints: {
                            'endpoint1': 'channel1',
                            'endpoint6': 'router1'
                        },
                        path: [{
                            x: 220,
                            y: 120,
                        }, {
                            x: 500,
                            y: 220
                        }],
                        colour: '#f82943'
                    }
                }
            }
        };
    }
]);
