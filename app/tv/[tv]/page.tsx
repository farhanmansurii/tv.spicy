import React from 'react'

export default function TVDetails({params}:{ params: { tv: string }}) {
  return (
    <div>{params.tv}</div>
  )
}
