package springbootkotlin.locationsserver.infrastructure.config.dialect

import org.hibernate.boot.model.TypeContributions
import org.hibernate.dialect.Dialect
import org.hibernate.dialect.identity.IdentityColumnSupport
import org.hibernate.dialect.identity.IdentityColumnSupportImpl
import org.hibernate.dialect.pagination.LimitHandler
import org.hibernate.query.spi.Limit
import org.hibernate.service.ServiceRegistry
import java.sql.PreparedStatement

@Suppress("DEPRECATION")
class SQLiteDialect : Dialect() {

    override fun contributeTypes(typeContributions: TypeContributions, serviceRegistry: ServiceRegistry) {
        super.contributeTypes(typeContributions, serviceRegistry)
        // 필요한 경우 추가 JDBC 타입 매핑 등록
    }

    override fun getIdentityColumnSupport(): IdentityColumnSupport {
        return SQLiteIdentityColumnSupport()
    }

    override fun getLimitHandler(): LimitHandler {
        return SQLiteLimitHandler
    }
}

class SQLiteIdentityColumnSupport : IdentityColumnSupportImpl() {
    override fun supportsIdentityColumns(): Boolean = true

    override fun getIdentityColumnString(type: Int): String = "integer"

    override fun getIdentitySelectString(table: String, column: String, type: Int): String {
        return "select last_insert_rowid()"
    }

    override fun hasDataTypeInIdentityColumn(): Boolean = false
}

object SQLiteLimitHandler : LimitHandler {
    override fun processSql(query: String, limit: Limit): String {
        val maxRows = limit.maxRows
        val firstRow = limit.firstRow ?: 0
        return if (maxRows == null || maxRows <= 0) {
            query
        } else if (firstRow > 0) {
            "$query limit $maxRows offset $firstRow"
        } else {
            "$query limit $maxRows"
        }
    }

    override fun bindLimitParametersAtStartOfQuery(limit: Limit, preparedStatement: PreparedStatement, index: Int): Int {
        // 쿼리 문자열에 직접 값을 삽입하므로 별도 바인딩 필요 없음.
        return index
    }

    override fun bindLimitParametersAtEndOfQuery(limit: Limit, preparedStatement: PreparedStatement, index: Int): Int {
        // 쿼리 문자열에 직접 값을 삽입하므로 별도 바인딩 필요 없음.
        return index
    }

    override fun setMaxRows(limit: Limit, preparedStatement: PreparedStatement) {
        // no-op
    }

    override fun supportsLimit(): Boolean = true

    override fun supportsOffset(): Boolean = true

    override fun supportsLimitOffset(): Boolean = true
}