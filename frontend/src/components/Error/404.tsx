import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import ProjectPage from 'components/App/ProjectPages'

/**
 * renders a heartfelt message to the user, explaining that they're lost.
 * Offer the user a button back to `Root`
 */
const PageNotFound: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate(ProjectPage.Root)
    })

    return () => clearTimeout(timeout)
  }, [navigate])

  return (
    <div>We're not sure how you got here, but let's help you find home.</div>
  )
}

export default PageNotFound
