import axios from 'axios'

const API_BASE = '/api'

export async function fetchIndices() {
  const { data } = await axios.get(`${API_BASE}/indices`)
  return data
}

export async function fetchStocks(bucket = '', search = '') {
  const params = {}
  if (bucket) params.bucket = bucket
  if (search) params.search = search
  const { data } = await axios.get(`${API_BASE}/stocks`, { params })
  return data
}
