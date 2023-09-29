import React from 'react'
import { Skeleton } from '../ui/skeleton'

export default function CardLoader() {
  return (
    <div>
      <Skeleton className='h-72 w-32 md:w-48'/>
    </div>
  )
}
