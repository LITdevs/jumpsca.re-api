import {cf, cfZoneId} from "../index.js";

export const supportedRecordTypes = [
    "A",
    "AAAA",
    "CNAME",
    "MX",
    "NS",
    "TXT",
    "CAA",
    "HTTPS",
    "SRV",
    "URI"
]

export const contentOnlyRecordTypes = [
    "A",
    "AAAA",
    "CNAME",
    "NS",
    "TXT"
]

export const priorityRequiredRecordTypes = [
    "MX",
    "URI"
]

export async function getRecords(address : string) {
    try {
        let res = await cf.dnsRecords.browse(cfZoneId, { "comment": address })
        return res.result.map(record => {
            return {
                id: record.id,
                name: record.name,
                type: record.type,
                ttl: record.ttl,
                content: record.content,
                data: record.data,
                priority: record.priority // For SOME reason MX and URI records have this on header, and the rest have it inside data
            }
        })

    } catch (e) {
        console.error(e)
        return null;
    }
}

export async function createRecord(address: string, recordData: any) {
    try {
        return await cf.dnsRecords.add(cfZoneId, {...recordData, comment: address});
    } catch (e : any) {
        // If cloudflare error, pass it back to caller, otherwise throw for use in 500 handler
        if (e?.response?.body) {
            return e
        }
        throw e;
    }
}

// The library uses PUT for some reason, this format seems to work
/*await cf.dnsRecords.edit(cfZoneId, "ed267a2e7fe3bbf31098be8b73535ecf", {
            content: "76.76.21.21",
            //tags: ["name:jumpsca.re"], Free has no tags, I guess... COMMENTS IT IS
            name: "jumpsca.re",
            type: "A",
            comment: "STemporary meopw A Record",
            proxied: false,
            ttl: 1
        })*/