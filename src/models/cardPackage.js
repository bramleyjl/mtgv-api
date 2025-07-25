import Model from './model.js';
import NodeCache from 'node-cache';

const packageCache = new NodeCache({ stdTTL: 1800, checkperiod: 120 });

class CardPackage extends Model {
  constructor() {
    super('cardPackages');
  }

  static getCache() {
    return packageCache;
  }

  static getById(packageId) {
    const cached = packageCache.get(`package:${packageId}`);
    return cached ? JSON.parse(cached) : null;
  }

  static save(cardPackage) {
    if (!cardPackage.package_id) throw new Error('Missing package_id');
    packageCache.set(`package:${cardPackage.package_id}`, JSON.stringify(cardPackage));
  }

  static delete(packageId) {
    packageCache.del(`package:${packageId}`);
  }

  static updateSelectedPrint(packageId, oracleId, scryfallId) {
    const cardPackage = this.getById(packageId);
    console.log('id', packageId);
    console.log('package', cardPackage);
    if (cardPackage && Array.isArray(cardPackage.package_entries)) {
      const entry = cardPackage.package_entries.find(e => e.oracle_id === oracleId);
      if (entry) {
        entry.selected_print = scryfallId;
        entry.user_selected = true;
        this.save(cardPackage);
        return true;
      }
    }
    return false;
  }
}

export default CardPackage;
