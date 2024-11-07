const AWS = require('aws-sdk');
const kinesis = new AWS.Kinesis();

const STREAM_NAME = process.env.USER_SIGNALS_STREAM;

exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    eventBodyJson = JSON.parse(event.body)

    const payload = JSON.stringify(eventBodyJson);
    const params = {
        Data: payload,
        PartitionKey: eventBodyJson.user_id,
        StreamName: STREAM_NAME
    };

    try {
        const result = await kinesis.putRecord(params).promise();
        console.log("Successfully put record to Kinesis:", result);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Successfully put record to Kinesis',
                result: result
            })
        };
    } catch (error) {
        console.error("Error putting record to Kinesis:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error putting record to Kinesis',
                error: error.message
            })
        };
    }
};