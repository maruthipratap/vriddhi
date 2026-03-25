import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import api from '../../services/api.js'

export default function SelectRolePage() {
  const navigate    = useNavigate()
  const { accessToken, user } = useSelector(s => s.auth)
  const [selected, setSelected] = useState(null)
  const [loading,  setLoading]  = useState(false)

  const roles = [
    {
      id:    'farmer',
      icon:  '🧑‍🌾',
      title: "I'm a Farmer",
      desc:  'Find nearby shops, compare prices, get AI crop advice',
      color: 'border-primary bg-primary/5',
    },
    {
      id:    'shop_owner',
      icon:  '🏪',
      title: 'I Own a Shop',
      desc:  'List products, connect with farmers, grow your business',
      color: 'border-accent bg-accent/5',
    },
  ]

  const handleContinue = () => {
    if (!selected) return
    if (selected === 'farmer') {
      navigate('/onboarding')
    } else {
      navigate('/shop/onboarding')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center
                    justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-4xl">🌱</span>
          <h1 className="font-heading text-3xl font-bold text-foreground mt-4">
            How will you use Vriddhi?
          </h1>
          <p className="text-muted-foreground mt-2">
            Choose your role to get a personalized experience
          </p>
        </div>

        {/* Role cards */}
        <div className="space-y-4">
          {roles.map((role, i) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelected(role.id)}
              className={`w-full flex items-center gap-4 p-5 rounded-xl
                          border-2 transition-all text-left
                          ${selected === role.id
                            ? role.color + ' shadow-md'
                            : 'border-border bg-card hover:border-primary/30'
                          }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center
                              justify-center text-3xl flex-shrink-0
                              ${selected === role.id
                                ? 'bg-primary/10'
                                : 'bg-secondary'
                              }`}>
                {role.icon}
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold
                               text-card-foreground">
                  {role.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {role.desc}
                </p>
              </div>
              {selected === role.id && (
                <span className="ml-auto text-primary text-xl">✓</span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Continue */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={handleContinue}
          disabled={!selected || loading}
          className="btn-primary w-full py-3 text-base mt-6
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white
                              border-t-transparent rounded-full animate-spin"/>
              Setting up...
            </div>
          ) : 'Continue →'}
        </motion.button>
      </motion.div>
    </div>
  )
}
