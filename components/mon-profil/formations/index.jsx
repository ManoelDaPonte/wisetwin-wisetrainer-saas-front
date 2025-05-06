// components/mon-profil/formations/index.jsx
import React from "react";
import { motion } from "framer-motion";
import FormationsRecentes from './FormationsRecentes';
import FormationsCompletes from './FormationsCompletes';

// Variants d'animation pour Framer Motion
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4 },
  },
};

/**
 * Composant principal pour la section des formations
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.formations - Liste des formations
 * @param {boolean} props.isLoading - État de chargement
 * @param {function} props.onViewAll - Callback pour le bouton "Voir tout"
 */
export default function Formations({ 
  formations = [], 
  isLoading = false, 
  onViewAll
}) {
  // Filtrer les formations terminées
  const formationsTerminees = React.useMemo(() => {
    return formations.filter(formation => formation.progress === 100);
  }, [formations]);

  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formations récentes */}
        <motion.div variants={itemVariants}>
          <FormationsRecentes
            formations={formations}
            isLoading={isLoading}
            onViewAll={onViewAll}
          />
        </motion.div>

        {/* Dernières formations terminées */}
        <motion.div variants={itemVariants}>
          <FormationsCompletes
            formations={formationsTerminees.slice(0, 5)}
            isLoading={isLoading}
          />
        </motion.div>
      </div>
    </section>
  );
}

// Exporte également les composants individuels pour une utilisation plus flexible
export { FormationsRecentes, FormationsCompletes };