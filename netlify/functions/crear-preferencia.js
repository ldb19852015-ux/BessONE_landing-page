const { MercadoPagoConfig, Preference } = require('mercadopago');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const bodyData = JSON.parse(event.body);
        const items = bodyData.items || [];

        // Validar que se envíen ítems
        if (!Array.isArray(items) || items.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No hay ítems en el carrito' })
            };
        }

        const client = new MercadoPagoConfig({ 
            accessToken: process.env.MP_ACCESS_TOKEN 
        });

        const preference = new Preference(client);

        // Convertir explícitamente a tipos de datos numéricos
        const itemsFormateados = items.map(item => ({
            title: String(item.title || 'Producto Bess ONE'),
            quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
            unit_price: parseFloat(item.unit_price) || 3500, // Ajustá el precio por defecto si querés
            currency_id: 'ARS'
        }));

        const response = await preference.create({
            body: {
                items: itemsFormateados,
                back_urls: {
                    success: 'https://cervezaartesanalbessone.netlify.app',
                    failure: 'https://cervezaartesanalbessone.netlify.app',
                    pending: 'https://cervezaartesanalbessone.netlify.app'
                },
                auto_return: 'approved'
            }
        });

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: response.id, 
                init_point: response.init_point 
            })
        };

    } catch (error) {
        console.error('Error en Mercado Pago:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'Error al crear la preferencia' })
        };
    }
};
