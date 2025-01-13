import axios, { CreateAxiosDefaults } from "axios";

let config: CreateAxiosDefaults = {
    baseURL: process.env.DHIS2_API_URL,
};

if (process.env.NODE_ENV === "development") {
    config = {
        ...config,
        auth: {
            username: process.env.DHIS2_USERNAME!,
            password: process.env.DHIS2_PASSWORD!,
        },
    };
}
export const api = axios.create(config);

export const getDHIS2Resource = async <T>({
    resource,
    params = {},
    includeApi = true,
}: {
    resource: string;
    params?: { [key: string]: string | number };
    includeApi?: boolean;
}) => {
    const actualResource = includeApi ? `api/${resource}` : resource;
    const { data } = await api.get<T>(actualResource, {
        params,
    });
    return data;
};

export const postDHIS2Resource = async <T>({
    resource,
    data,
    params = {},
    includeApi = true,
}: {
    resource: string;
    params?: Record<string, string | number | boolean>;
    includeApi?: boolean;
    data: object;
}) => {
    const actualResource = includeApi ? `api/${resource}` : resource;
    const { data: response } = await api.post<T>(actualResource, data, {
        params,
    });
    return response;
};

export const deleteDHIS2Resource = async <T>({
    resource,
    id,
    includeApi = true,
}: {
    resource: string;
    includeApi?: boolean;
    id: string;
}) => {
    const actualResource = includeApi
        ? `api/${resource}/${id}`
        : `${resource}/${id}`;
    const { data } = await api.delete<T>(actualResource);
    return data;
};

export const putDHIS2Resource = async <T>({
    resource,
    id,
    data,
    params,
    includeApi = true,
}: {
    resource: string;
    includeApi?: boolean;
    id: string;
    data: object;
    params?: Record<string, string | number>;
}) => {
    const actualResource = includeApi
        ? `api/${resource}/${id}`
        : `${resource}/${id}`;
    const { data: response } = await api.put<T>(actualResource, data, {
        params,
    });
    return response;
};
