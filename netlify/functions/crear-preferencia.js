const { MercadoPagoConfig, Preference } = require('mercadopago');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Método no permitido' }) 
    };
  }

  try {
    // Lee el MP_ACCESS_TOKEN que guardaste en el panel de Netlify
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MP_ACCESS_TOKEN 
    });
    
    const preference = new Preference(client);
    const body = JSON.parse(event.body);

    // Formateamos los productos enviados desde el carrito
    const itemsMP = body.items.map(item => ({
      title: item.titulo,
      quantity: Number(item.cantidad),
      unit_price: Number(item.precio),
      currency_id: 'ARS'
    }));

    const result = await preference.create({
      body: {
        items: itemsMP,
        back_urls: {
          success: 'https://tu-sitio.netlify.app/?pago=exito',
          failure: 'https://tu-sitio.netlify.app/?pago=fallo',
          pending: 'https://tu-sitio.netlify.app/?pago=pendiente'
        },
        auto_return: 'approved'
      }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ init_point: result.init_point })
    };

  } catch (error) {
    console.error("Error en Mercado Pago:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error al generar el pago", details: error.message })
    };
  }
};
