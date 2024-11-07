const AWS = require('aws-sdk');
const crypto = require('crypto');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.USER_ANONYMIZATION_TABLE;

exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    if (!event.records) {
        console.error("No records found in the event");
        return { records: [] };
    }

    const output = await Promise.all(event.records.map(async (record) => {
        const payload = Buffer.from(record.data, 'base64').toString('utf-8');
        console.log("Decoded payload:", payload);

        // Parse the payload to JSON
        let jsonPayload;
        try {
            jsonPayload = JSON.parse(payload);
        } catch (err) {
            console.error("Error parsing JSON payload:", err);
            return {
                recordId: record.recordId,
                result: 'ProcessingFailed',
                data: record.data
            };
        }

        const userId = jsonPayload.user_id;

        // Check if user_id exists in DynamoDB
        const getParams = {
            TableName: TABLE_NAME,
            Key: {
                pk: userId
            }
        };

        let hashedUserId;
        try {
            const data = await dynamoDB.get(getParams).promise();
            if (data.Item) {
                console.log(`User ID ${userId} found, use the existing hash`)
                hashedUserId = data.Item.data;
            } else {
                console.log(`User ID ${userId} not found, creating a new existing hash`)
                hashedUserId = crypto.createHash('sha256').update(userId).digest('hex');
                const putParams = {
                    TableName: TABLE_NAME,
                    Item: {
                        pk: userId,
                        data: hashedUserId
                    }
                };
                await dynamoDB.put(putParams).promise();
            }
        } catch (err) {
            console.error("Error accessing DynamoDB:", err);
            return {
                recordId: record.recordId,
                result: 'ProcessingFailed',
                data: record.data
            };
        }

        // Update the user_id in the payload with the hashed value
        jsonPayload.user_id = hashedUserId;

        // Return the transformed record
        return {
            recordId: record.recordId,
            result: 'Ok',
            data: Buffer.from(JSON.stringify(jsonPayload)).toString('base64')
        };
    }));

    return { records: output };
};