export default {
    $id: 'figure',
    type: 'object',
    required: [
        'name',
    ],
    properties: {
        name: { type: 'string'},
        maker_id: { type: 'integer' },
        count: { type: 'integer' },
        scale: { type: 'integer' },
        built: { type: 'integer' },
        primed: { type: 'integer' },
        painted: { type: 'integer' },
        material: { type: 'string' },
        base_shape: { type: 'string' },
        base_size: { type: 'string' },
        tag_ids: {
            type: 'array',
            items: { type: 'integer' }
        },
    }
};
